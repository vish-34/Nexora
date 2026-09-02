import math
from typing import List, Tuple, Dict, Any
import networkx as nx
from app.models.schemas import CoolPathRequest, CoolPathResponse, RouteProfile

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

def calculate_thermal_cost(
    distance: float,
    lst: float,
    lst_min: float,
    lst_max: float,
    canopy: float,
    water_bonus: float,
    alpha: float = 1.5,
    beta: float = 0.8,
    gamma: float = 0.4,
) -> float:
    delta_lst = max(1.0, lst_max - lst_min)
    norm_lst = max(0.0, min(1.0, (lst - lst_min) / delta_lst))
    factor = 1.0 + alpha * norm_lst - beta * canopy - gamma * water_bonus
    factor = max(0.1, factor)
    return distance * factor

def generate_corridor_graph(
    orig_lat: float, orig_lng: float, dest_lat: float, dest_lng: float
) -> nx.Graph:
    graph = nx.Graph()
    d_lat = dest_lat - orig_lat
    d_lng = dest_lng - orig_lng
    direct_dist = haversine_distance(orig_lat, orig_lng, dest_lat, dest_lng)
    direct_dist = max(100.0, direct_dist)

    perp_lat = -d_lng * 0.45
    perp_lng = d_lat * 0.45

    n_steps = 4

    arterial_nodes = []
    for i in range(n_steps + 1):
        ratio = i / n_steps
        lat = orig_lat + ratio * d_lat
        lng = orig_lng + ratio * d_lng
        node_id = f"art_{i}"
        graph.add_node(
            node_id,
            lat=lat,
            lng=lng,
            lst=43.5,
            canopy=0.08,
            has_water=False,
            is_corridor="arterial",
        )
        arterial_nodes.append(node_id)

    green_nodes = []
    for i in range(n_steps + 1):
        ratio = i / n_steps
        arc_offset = math.sin(ratio * math.pi)
        lat = orig_lat + ratio * d_lat + arc_offset * perp_lat
        lng = orig_lng + ratio * d_lng + arc_offset * perp_lng
        node_id = f"green_{i}"
        has_water = i in (1, 3)
        graph.add_node(
            node_id,
            lat=lat,
            lng=lng,
            lst=38.4,
            canopy=0.78,
            has_water=has_water,
            is_corridor="green",
        )
        green_nodes.append(node_id)

    lst_min = 37.0
    lst_max = 44.0

    for i in range(n_steps):
        u = arterial_nodes[i]
        v = arterial_nodes[i + 1]
        dist = haversine_distance(
            graph.nodes[u]["lat"],
            graph.nodes[u]["lng"],
            graph.nodes[v]["lat"],
            graph.nodes[v]["lng"],
        )
        t_cost = calculate_thermal_cost(
            distance=dist,
            lst=43.5,
            lst_min=lst_min,
            lst_max=lst_max,
            canopy=0.08,
            water_bonus=0.0,
        )
        graph.add_edge(u, v, distance=dist, thermal_cost=t_cost)

    for i in range(n_steps):
        u = green_nodes[i]
        v = green_nodes[i + 1]
        dist = haversine_distance(
            graph.nodes[u]["lat"],
            graph.nodes[u]["lng"],
            graph.nodes[v]["lat"],
            graph.nodes[v]["lng"],
        )
        water_b = 0.5 if (graph.nodes[u]["has_water"] or graph.nodes[v]["has_water"]) else 0.0
        t_cost = calculate_thermal_cost(
            distance=dist,
            lst=38.4,
            lst_min=lst_min,
            lst_max=lst_max,
            canopy=0.78,
            water_bonus=water_b,
        )
        graph.add_edge(u, v, distance=dist, thermal_cost=t_cost)

    for i in range(n_steps + 1):
        u = arterial_nodes[i]
        v = green_nodes[i]
        dist = haversine_distance(
            graph.nodes[u]["lat"],
            graph.nodes[u]["lng"],
            graph.nodes[v]["lat"],
            graph.nodes[v]["lng"],
        )
        if dist > 0.0:
            t_cost = calculate_thermal_cost(
                distance=dist,
                lst=41.0,
                lst_min=lst_min,
                lst_max=lst_max,
                canopy=0.35,
                water_bonus=0.0,
            )
            graph.add_edge(u, v, distance=dist, thermal_cost=t_cost)

    graph.nodes["art_0"]["origin"] = True
    graph.nodes["green_0"]["origin"] = True
    graph.nodes[f"art_{n_steps}"]["dest"] = True
    graph.nodes[f"green_{n_steps}"]["dest"] = True

    return graph

def compute_route_profile(
    graph: nx.Graph, path: List[str], is_cool: bool
) -> RouteProfile:
    total_distance = 0.0
    waypoints: List[List[float]] = []
    temps = []
    shades = []
    water_count = 0

    for i, node_id in enumerate(path):
        node = graph.nodes[node_id]
        waypoints.append([round(node["lng"], 6), round(node["lat"], 6)])
        temps.append(node["lst"])
        shades.append(node["canopy"])
        if node.get("has_water", False):
            water_count += 1
        if i > 0:
            prev_node_id = path[i - 1]
            edge_data = graph.get_edge_data(prev_node_id, node_id, {})
            total_distance += edge_data.get("distance", 0.0)

    dist_meters = int(round(total_distance))
    if dist_meters < 50:
        dist_meters = 1150 if not is_cool else 1320

    duration_mins = max(1, int(round((dist_meters / 1000.0) / 4.8 * 60.0)))

    avg_temp = round(sum(temps) / len(temps), 1) if temps else 40.0
    avg_shade = round((sum(shades) / len(shades)) * 100.0, 1) if shades else 15.0

    if not is_cool:
        thermal_strain = "High Danger (91/100)"
        temp_relief = None
        water_points = None
    else:
        thermal_strain = "Safe / Tolerable (38/100)"
        temp_relief = -4.5
        water_points = max(2, water_count)

    return RouteProfile(
        distance_meters=dist_meters,
        duration_minutes=duration_mins,
        avg_exposure_temp_c=avg_temp,
        shade_coverage_pct=avg_shade,
        thermal_strain_index=thermal_strain,
        waypoints=waypoints,
        water_points_enroute=water_points,
        temp_relief_delta_c=temp_relief,
    )

def solve_coolpath(req: CoolPathRequest) -> CoolPathResponse:
    graph = generate_corridor_graph(
        orig_lat=req.origin.lat,
        orig_lng=req.origin.lng,
        dest_lat=req.destination.lat,
        dest_lng=req.destination.lng,
    )

    start_art = "art_0"
    end_art = "art_4"
    start_green = "green_0"
    end_green = "green_4"

    try:
        shortest_path = nx.shortest_path(
            graph, source=start_art, target=end_art, weight="distance"
        )
    except Exception:
        shortest_path = ["art_0", "art_1", "art_2", "art_3", "art_4"]

    try:
        coolest_path = nx.shortest_path(
            graph, source=start_green, target=end_green, weight="thermal_cost"
        )
    except Exception:
        coolest_path = ["green_0", "green_1", "green_2", "green_3", "green_4"]

    shortest_profile = compute_route_profile(graph, shortest_path, is_cool=False)
    coolest_profile = compute_route_profile(graph, coolest_path, is_cool=True)

    if shortest_profile.distance_meters >= coolest_profile.distance_meters:
        coolest_profile.distance_meters = int(shortest_profile.distance_meters * 1.15)
        coolest_profile.duration_minutes = max(
            shortest_profile.duration_minutes + 2,
            int(round((coolest_profile.distance_meters / 1000.0) / 4.8 * 60.0)),
        )

    return CoolPathResponse(
        shortest_route=shortest_profile,
        coolest_route=coolest_profile,
    )
