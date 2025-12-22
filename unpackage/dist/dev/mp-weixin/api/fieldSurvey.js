"use strict";
const utils_request = require("../utils/request.js");
function fetchConstructionData(userId, projectId) {
  return utils_request.request.get("/api/v1/completion/tzdDetail/getConstructContent", {
    data: {
      user_id: userId,
      project_id: projectId
    }
  });
}
function fetchEquipmentData(userId, projectId) {
  return utils_request.request.get("/api/v1/completion/tzdDetail/getDeviceDetail", {
    data: {
      user_id: userId,
      project_id: projectId
    }
  });
}
exports.fetchConstructionData = fetchConstructionData;
exports.fetchEquipmentData = fetchEquipmentData;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/fieldSurvey.js.map
