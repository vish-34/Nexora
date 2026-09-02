const asyncHandler = require("express-async-handler");
const {
  getNationalPins,
  getStateDistrictPins,
  getDistrictNeighborhoodPins,
} = require("../services/spatialPinService");

/**
 * @desc   Get hierarchical map pins filtered by focus point (country, state, district)
 * @route  GET /api/pins
 * @query  level: 'country' | 'state' | 'district'
 *         parentId: 'india' | 'maharashtra' | 'rajasthan' | 'mumbai' | 'jodhpur' ...
 */
const getPins = asyncHandler(async (req, res) => {
  const { level, parentId, stateId, districtId, type, name, lng, lat, lst_celsius, tree_count } = req.query;

  const targetLevel = level ? String(level).toLowerCase() : "country";
  const targetParent = (parentId || stateId || districtId || "india").toLowerCase();

  let pins = [];

  if (targetLevel === "country" || targetParent === "india" || targetParent === "world") {
    // LEVEL 1: Whole India Focused
    pins = getNationalPins();
  } else if (targetLevel === "state") {
    // LEVEL 2: A particular state focused -> Returns pins for EVERY district in that state!
    pins = getStateDistrictPins(targetParent);
  } else {
    // LEVEL 3: A particular district clicked -> Returns 5-6 localized neighborhood pins
    // naturally spaced across 15-35 km of the district's geography!
    pins = getDistrictNeighborhoodPins(
      targetParent,
      name,
      lng,
      lat,
      lst_celsius,
      tree_count
    );
  }

  // Filter by type if requested
  if (type) {
    const t = String(type).toLowerCase();
    pins = pins.filter((p) => p.type === t);
  }

  res.json({
    success: true,
    count: pins.length,
    level: targetLevel,
    parentId: targetParent,
    data: pins,
  });
});

/**
 * @desc   Create a new pin (e.g. from citizen report)
 * @route  POST /api/pins
 */
const createPin = asyncHandler(async (req, res) => {
  const pinData = req.body;
  if (!pinData.id) {
    pinData.id = `PIN_${Date.now().toString().slice(-6)}`;
  }
  return res.status(201).json({ success: true, data: pinData });
});

module.exports = { getPins, createPin };
