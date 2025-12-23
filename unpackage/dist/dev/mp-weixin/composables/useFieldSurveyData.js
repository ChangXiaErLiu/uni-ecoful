"use strict";
const common_vendor = require("../common/vendor.js");
const api_fieldSurvey = require("../api/fieldSurvey.js");
let instance = null;
function useFieldSurveyData() {
  if (instance) {
    return instance;
  }
  const tabs = ["建设内容", "设备情况", "治理设施", "排污口"];
  const currentTab = common_vendor.ref(0);
  const fieldworkComparison = common_vendor.ref([]);
  const mainContentTable = common_vendor.ref([
    {
      id: "mc_1",
      label: "项目名称",
      value: "",
      type: "text"
    },
    {
      id: "mc_2",
      label: "建设单位",
      value: "",
      type: "text"
    },
    {
      id: "mc_3",
      label: "建设地点",
      value: "",
      type: "text"
    },
    {
      id: "mc_4",
      label: "建设规模",
      value: "",
      type: "text"
    },
    {
      id: "mc_5",
      label: "主体工程",
      value: [],
      type: "image"
    }
  ]);
  const selectModeMain = common_vendor.ref(false);
  const selectedMainIds = common_vendor.ref([]);
  function toggleSelectModeMain() {
    selectModeMain.value = !selectModeMain.value;
    if (!selectModeMain.value)
      selectedMainIds.value = [];
  }
  function toggleSelectedMain(id) {
    const idx = selectedMainIds.value.indexOf(id);
    if (idx > -1)
      selectedMainIds.value.splice(idx, 1);
    else
      selectedMainIds.value.push(id);
  }
  function removeSelectedMain() {
    mainContentTable.value = mainContentTable.value.filter(
      (item) => !selectedMainIds.value.includes(item.id)
    );
    selectedMainIds.value = [];
    selectModeMain.value = false;
    common_vendor.index.showToast({
      title: "删除成功",
      icon: "success"
    });
  }
  const constructionList = common_vendor.ref([]);
  const constructionSearchKeyword = common_vendor.ref("");
  const loadingConstruction = common_vendor.ref(false);
  const fetchConstructionError = common_vendor.ref("");
  const filteredConstructionList = common_vendor.computed(() => {
    if (!constructionSearchKeyword.value) {
      return constructionList.value;
    }
    const keyword = constructionSearchKeyword.value.toLowerCase().trim();
    return constructionList.value.filter((item) => {
      const category = (item.category || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      const content = (item.content || "").toLowerCase();
      const remark = (item.remark || "").toLowerCase();
      return category.includes(keyword) || name.includes(keyword) || content.includes(keyword) || remark.includes(keyword);
    });
  });
  function onConstructionSearchInput() {
    common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:109", "搜索主体工程关键词:", constructionSearchKeyword.value);
  }
  function parseConstructionData(apiData) {
    try {
      const parsedConstruction = [];
      if (!apiData || !Array.isArray(apiData) || apiData.length <= 1) {
        return [];
      }
      for (let i = 1; i < apiData.length; i++) {
        const row = apiData[i];
        if (row.column_1) {
          const columns = row.column_1.includes("	") ? row.column_1.split("	") : row.column_1.split("\\t");
          if (columns.length >= 6) {
            const category = columns[0] || "";
            const name = columns[1] || "";
            const content = columns[4] || "";
            if (name.trim()) {
              parsedConstruction.push({
                id: "const_" + Date.now() + "_" + i,
                category: category.trim(),
                name: name.trim(),
                content: content.trim(),
                remark: "",
                images: []
              });
            }
          } else {
            common_vendor.index.__f__("warn", "at composables/useFieldSurveyData.js:147", `第${i + 1}行数据列数不足 (${columns.length}列):`, columns);
          }
        } else {
          common_vendor.index.__f__("warn", "at composables/useFieldSurveyData.js:150", `第${i + 1}行没有column_1字段:`, row);
        }
      }
      return parsedConstruction;
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:156", "解析主体工程数据失败:", error);
      return [];
    }
  }
  async function fetchConstructionData(userId, projectId) {
    loadingConstruction.value = true;
    fetchConstructionError.value = "";
    try {
      const resData = await api_fieldSurvey.fetchConstructionData(userId, projectId);
      if (resData && resData.data) {
        const apiData = resData.data;
        if (apiData && Array.isArray(apiData) && apiData.length > 1) {
          const parsedData = parseConstructionData(apiData);
          if (parsedData.length > 0) {
            constructionList.value = parsedData;
            common_vendor.index.showToast({
              title: `加载成功`,
              icon: "success",
              duration: 2e3
            });
          } else {
            fetchConstructionError.value = "解析到的工程数据为空";
            common_vendor.index.showToast({
              title: "工程数据解析为空",
              icon: "none",
              duration: 2e3
            });
          }
        } else {
          fetchConstructionError.value = "接口返回的工程数据格式不正确";
          common_vendor.index.showToast({
            title: "工程数据格式错误",
            icon: "none",
            duration: 2e3
          });
        }
      } else {
        fetchConstructionError.value = (resData == null ? void 0 : resData.message) || "接口返回数据格式异常";
        common_vendor.index.showToast({
          title: "获取工程数据失败",
          icon: "none",
          duration: 2e3
        });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:212", "获取主体工程数据失败:", error);
      fetchConstructionError.value = error.message || "网络请求失败";
      common_vendor.index.showToast({
        title: "网络请求失败，请检查网络连接",
        icon: "none",
        duration: 2e3
      });
    } finally {
      loadingConstruction.value = false;
    }
  }
  function addConstruction() {
    const newConstruction = {
      id: "const_" + Date.now(),
      category: "主体工程",
      name: "",
      content: "",
      remark: "",
      images: []
    };
    constructionList.value.push(newConstruction);
    common_vendor.index.showToast({
      title: "已添加新工程",
      icon: "success"
    });
  }
  function removeConstruction(index) {
    common_vendor.index.showModal({
      title: "确认删除",
      content: "确定要删除这条工程记录吗？",
      success: (res) => {
        if (res.confirm) {
          constructionList.value.splice(index, 1);
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
        }
      }
    });
  }
  const equipmentList = common_vendor.ref([]);
  const equipmentSearchKeyword = common_vendor.ref("");
  const loadingEquipment = common_vendor.ref(false);
  const fetchEquipmentError = common_vendor.ref("");
  const filteredEquipmentList = common_vendor.computed(() => {
    if (!equipmentSearchKeyword.value) {
      return equipmentList.value;
    }
    const keyword = equipmentSearchKeyword.value.toLowerCase().trim();
    return equipmentList.value.filter((equipment) => {
      const name = (equipment.name || "").toLowerCase();
      const quantity = (equipment.quantity || "").toLowerCase();
      const remark = (equipment.remark || "").toLowerCase();
      return name.includes(keyword) || quantity.includes(keyword) || remark.includes(keyword);
    });
  });
  function onEquipmentSearchInput() {
    common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:280", "搜索设备关键词:", equipmentSearchKeyword.value);
  }
  function parseEquipmentData(apiData) {
    try {
      const parsedEquipment = [];
      if (!apiData || !Array.isArray(apiData) || apiData.length <= 1) {
        return [];
      }
      for (let i = 1; i < apiData.length; i++) {
        const row = apiData[i];
        if (row.column_1) {
          const columns = row.column_1.includes("	") ? row.column_1.split("	") : row.column_1.split("\\t");
          if (columns.length >= 4) {
            const deviceName = columns[1] || "";
            const quantity = columns[3] || "";
            if (deviceName.trim()) {
              parsedEquipment.push({
                id: "eq_" + Date.now() + "_" + i,
                name: deviceName.trim(),
                quantity: quantity.trim(),
                remark: "",
                images: []
              });
            }
          } else {
            common_vendor.index.__f__("warn", "at composables/useFieldSurveyData.js:316", `第${i + 1}行数据列数不足 (${columns.length}列):`, columns);
          }
        } else {
          common_vendor.index.__f__("warn", "at composables/useFieldSurveyData.js:319", `第${i + 1}行没有column_1字段:`, row);
        }
      }
      return parsedEquipment;
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:325", "解析设备数据失败:", error);
      return [];
    }
  }
  async function fetchEquipmentData(userId, projectId) {
    loadingEquipment.value = true;
    fetchEquipmentError.value = "";
    try {
      const resData = await api_fieldSurvey.fetchEquipmentData(userId, projectId);
      if (resData && resData.data) {
        const apiData = resData.data;
        if (apiData && Array.isArray(apiData) && apiData.length > 1) {
          const parsedData = parseEquipmentData(apiData);
          if (parsedData.length > 0) {
            equipmentList.value = parsedData;
            common_vendor.index.showToast({
              title: `加载成功，共${parsedData.length}条设备数据`,
              icon: "success",
              duration: 2e3
            });
          } else {
            fetchEquipmentError.value = "解析到的设备数据为空";
            common_vendor.index.showToast({
              title: "设备数据解析为空",
              icon: "none",
              duration: 2e3
            });
          }
        } else {
          fetchEquipmentError.value = "接口返回的设备数据格式不正确";
          common_vendor.index.showToast({
            title: "设备数据格式错误",
            icon: "none",
            duration: 2e3
          });
        }
      } else {
        fetchEquipmentError.value = (resData == null ? void 0 : resData.message) || "接口返回数据格式异常";
        common_vendor.index.showToast({
          title: "获取设备数据失败",
          icon: "none",
          duration: 2e3
        });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:379", "获取设备数据失败:", error);
      fetchEquipmentError.value = error.message || "网络请求失败";
      common_vendor.index.showToast({
        title: "网络请求失败，请检查网络连接",
        icon: "none",
        duration: 2e3
      });
    } finally {
      loadingEquipment.value = false;
    }
  }
  function addEquipment() {
    const newEquipment = {
      id: "eq_" + Date.now(),
      name: "",
      quantity: "",
      remark: "",
      images: []
    };
    equipmentList.value.push(newEquipment);
    common_vendor.index.showToast({
      title: "已添加新设备",
      icon: "success"
    });
  }
  function removeEquipment(index) {
    common_vendor.index.showModal({
      title: "确认删除",
      content: "确定要删除这条设备记录吗？",
      success: (res) => {
        if (res.confirm) {
          equipmentList.value.splice(index, 1);
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
        }
      }
    });
  }
  const pollutionFacilityList = common_vendor.ref([]);
  const facilitySearchKeyword = common_vendor.ref("");
  const loadingFacility = common_vendor.ref(false);
  const fetchFacilityError = common_vendor.ref("");
  const filteredFacilityList = common_vendor.computed(() => {
    if (!facilitySearchKeyword.value) {
      return pollutionFacilityList.value;
    }
    const keyword = facilitySearchKeyword.value.toLowerCase().trim();
    return pollutionFacilityList.value.filter((facility) => {
      const name = (facility.name || "").toLowerCase();
      const quantity = (facility.quantity || "").toLowerCase();
      const remark = (facility.remark || "").toLowerCase();
      return name.includes(keyword) || quantity.includes(keyword) || remark.includes(keyword);
    });
  });
  function onFacilitySearchInput() {
    common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:446", "搜索设施关键词:", facilitySearchKeyword.value);
  }
  function extractFacilitiesFromBaseTable(projectId, baseTable) {
    var _a;
    try {
      loadingFacility.value = true;
      fetchFacilityError.value = "";
      const emissionData = (_a = baseTable.find((x) => x.id === "pollutants_emission")) == null ? void 0 : _a.value;
      if (!emissionData || typeof emissionData !== "object") {
        common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:462", "未找到污染物信息，跳过设施提取");
        pollutionFacilityList.value = [];
        saveFacilityList(projectId, []);
        loadingFacility.value = false;
        return;
      }
      const facilityList = [];
      const pollutantTypes = ["水污染物", "大气污染物", "噪声"];
      pollutantTypes.forEach((type) => {
        const pollutants = emissionData[type];
        if (!pollutants)
          return;
        if (Array.isArray(pollutants)) {
          pollutants.forEach((item, index) => {
            const pollutantName = item["污染物名称"] || item["废物名称"] || "";
            const treatmentMeasure = item["污染治理措施"] || item["治理措施"] || "";
            if (pollutantName.trim()) {
              facilityList.push({
                id: `facility_${type}_${index}_${Date.now()}`,
                name: pollutantName.trim(),
                quantity: treatmentMeasure.trim(),
                remark: "",
                images: [],
                pollutantType: type
                // 记录污染物类型
              });
            }
          });
        } else if (typeof pollutants === "object") {
          const pollutantName = pollutants["污染物名称"] || pollutants["废物名称"] || "";
          const treatmentMeasure = pollutants["污染治理措施"] || pollutants["治理措施"] || "";
          if (pollutantName.trim()) {
            facilityList.push({
              id: `facility_${type}_${Date.now()}`,
              name: pollutantName.trim(),
              quantity: treatmentMeasure.trim(),
              remark: "",
              images: [],
              pollutantType: type
            });
          }
        }
      });
      facilityList.push({
        id: `facility_solid_waste_${Date.now()}`,
        name: "一般固废暂存间",
        quantity: "",
        remark: "",
        images: [],
        pollutantType: "固体废物"
      });
      facilityList.push({
        id: `facility_hazardous_waste_${Date.now()}`,
        name: "危废暂存间",
        quantity: "",
        remark: "",
        images: [],
        pollutantType: "危险废物"
      });
      pollutionFacilityList.value = facilityList;
      saveFacilityList(projectId, facilityList);
      common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:539", `✅ 从项目 ${projectId} 提取了 ${facilityList.length} 条治理设施（含2条固废暂存间）`);
      if (facilityList.length > 0) {
        common_vendor.index.showToast({
          title: `已提取 ${facilityList.length} 条设施`,
          icon: "success",
          duration: 2e3
        });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:550", "提取治理设施失败:", error);
      fetchFacilityError.value = error.message || "提取失败";
      common_vendor.index.showToast({
        title: "提取治理设施失败",
        icon: "none",
        duration: 2e3
      });
    } finally {
      loadingFacility.value = false;
    }
  }
  function saveFacilityList(projectId, facilityList) {
    try {
      const cacheKey = `project_facility_list_${projectId}`;
      common_vendor.index.setStorageSync(cacheKey, JSON.stringify(facilityList));
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:573", "保存治理设施失败:", error);
    }
  }
  function loadFacilityList(projectId) {
    try {
      loadingFacility.value = true;
      fetchFacilityError.value = "";
      const cacheKey = `project_facility_list_${projectId}`;
      const cachedData = common_vendor.index.getStorageSync(cacheKey);
      if (cachedData) {
        pollutionFacilityList.value = JSON.parse(cachedData);
        common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:591", `✅ 已加载项目 ${projectId} 的治理设施，共 ${pollutionFacilityList.value.length} 条`);
      } else {
        pollutionFacilityList.value = [];
        common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:594", `ℹ️ 项目 ${projectId} 暂无治理设施数据`);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:597", "加载治理设施失败:", error);
      pollutionFacilityList.value = [];
      fetchFacilityError.value = error.message || "加载失败";
    } finally {
      loadingFacility.value = false;
    }
  }
  function refreshFacilityData(projectId, baseTable) {
    extractFacilitiesFromBaseTable(projectId, baseTable);
  }
  function addPollutionFacility(projectId) {
    const newFacility = {
      id: "pf_" + Date.now(),
      name: "",
      quantity: "",
      remark: "",
      images: []
    };
    pollutionFacilityList.value.push(newFacility);
    if (projectId) {
      saveFacilityList(projectId, pollutionFacilityList.value);
    }
    common_vendor.index.showToast({
      title: "已添加新设施",
      icon: "success"
    });
  }
  function removePollutionFacility(index, projectId) {
    common_vendor.index.showModal({
      title: "确认删除",
      content: "确定要删除这条设施记录吗？",
      success: (res) => {
        if (res.confirm) {
          pollutionFacilityList.value.splice(index, 1);
          if (projectId) {
            saveFacilityList(projectId, pollutionFacilityList.value);
          }
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
        }
      }
    });
  }
  function updateFacilityData(projectId) {
    if (projectId) {
      saveFacilityList(projectId, pollutionFacilityList.value);
    }
  }
  const wastewaterOutlets = common_vendor.ref([]);
  const exhaustOutlets = common_vendor.ref([]);
  const noiseOutlets = common_vendor.ref([]);
  function extractOutletsFromBaseTable(projectId, baseTable) {
    var _a;
    try {
      let splitOutletCodes = function(codeString) {
        if (!codeString || typeof codeString !== "string")
          return [];
        const codes = codeString.split(/[;,，、\s]+/).map((code) => code.trim()).filter((code) => code && code.length > 0);
        return codes;
      };
      const emissionData = (_a = baseTable.find((x) => x.id === "pollutants_emission")) == null ? void 0 : _a.value;
      if (!emissionData || typeof emissionData !== "object") {
        common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:681", "未找到污染物信息，跳过排污口提取");
        wastewaterOutlets.value = [];
        exhaustOutlets.value = [];
        noiseOutlets.value = [];
        saveOutletList(projectId, [], [], []);
        return;
      }
      const wastewaterList = [];
      const exhaustList = [];
      const noiseList = [];
      const waterPollutants = emissionData["水污染物"];
      if (waterPollutants) {
        const pollutantArray = Array.isArray(waterPollutants) ? waterPollutants : [waterPollutants];
        pollutantArray.forEach((item) => {
          const outletCode = item["排污口编号"] || item["排放口编号"] || "";
          const codes = splitOutletCodes(outletCode);
          codes.forEach((code) => {
            if (!wastewaterList.some((o) => o.code === code)) {
              wastewaterList.push({
                id: `outlet_wastewater_${code}_${Date.now()}`,
                code,
                name: "",
                remark: "",
                images: []
              });
            }
          });
        });
      }
      const airPollutants = emissionData["大气污染物"];
      if (airPollutants) {
        const pollutantArray = Array.isArray(airPollutants) ? airPollutants : [airPollutants];
        pollutantArray.forEach((item) => {
          const outletCode = item["排污口编号"] || item["排放口编号"] || "";
          const codes = splitOutletCodes(outletCode);
          codes.forEach((code) => {
            if (!exhaustList.some((o) => o.code === code)) {
              exhaustList.push({
                id: `outlet_exhaust_${code}_${Date.now()}`,
                code,
                name: "",
                remark: "",
                images: []
              });
            }
          });
        });
      }
      const noisePollutants = emissionData["噪声"];
      if (noisePollutants) {
        const pollutantArray = Array.isArray(noisePollutants) ? noisePollutants : [noisePollutants];
        pollutantArray.forEach((item) => {
          const outletCode = item["排污口编号"] || item["排放口编号"] || "";
          const codes = splitOutletCodes(outletCode);
          codes.forEach((code) => {
            if (!noiseList.some((o) => o.code === code)) {
              noiseList.push({
                id: `outlet_noise_${code}_${Date.now()}`,
                code,
                name: "",
                remark: "",
                images: []
              });
            }
          });
        });
      }
      wastewaterOutlets.value = wastewaterList;
      exhaustOutlets.value = exhaustList;
      noiseOutlets.value = noiseList;
      saveOutletList(projectId, wastewaterList, exhaustList, noiseList);
      const totalCount = wastewaterList.length + exhaustList.length + noiseList.length;
      common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:788", `✅ 从项目 ${projectId} 提取了 ${totalCount} 个排污口`);
      if (totalCount > 0) {
        common_vendor.index.showToast({
          title: `已提取 ${totalCount} 个排污口`,
          icon: "success",
          duration: 2e3
        });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:799", "提取排污口失败:", error);
      common_vendor.index.showToast({
        title: "提取排污口失败",
        icon: "none",
        duration: 2e3
      });
    }
  }
  function saveOutletList(projectId, wastewaterList, exhaustList, noiseList) {
    try {
      const cacheKey = `project_outlet_list_${projectId}`;
      const outletData = {
        wastewater: wastewaterList,
        exhaust: exhaustList,
        noise: noiseList
      };
      common_vendor.index.setStorageSync(cacheKey, JSON.stringify(outletData));
      common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:824", `✅ 项目 ${projectId} 的排污口已保存到本地`);
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:826", "保存排污口失败:", error);
    }
  }
  function loadOutletList(projectId) {
    try {
      const cacheKey = `project_outlet_list_${projectId}`;
      const cachedData = common_vendor.index.getStorageSync(cacheKey);
      if (cachedData) {
        const outletData = JSON.parse(cachedData);
        wastewaterOutlets.value = outletData.wastewater || [];
        exhaustOutlets.value = outletData.exhaust || [];
        noiseOutlets.value = outletData.noise || [];
        const totalCount = wastewaterOutlets.value.length + exhaustOutlets.value.length + noiseOutlets.value.length;
        common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:846", `✅ 已加载项目 ${projectId} 的排污口，共 ${totalCount} 个`);
      } else {
        wastewaterOutlets.value = [];
        exhaustOutlets.value = [];
        noiseOutlets.value = [];
        common_vendor.index.__f__("log", "at composables/useFieldSurveyData.js:851", `ℹ️ 项目 ${projectId} 暂无排污口数据`);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useFieldSurveyData.js:854", "加载排污口失败:", error);
      wastewaterOutlets.value = [];
      exhaustOutlets.value = [];
      noiseOutlets.value = [];
    }
  }
  function refreshOutletData(projectId, baseTable) {
    extractOutletsFromBaseTable(projectId, baseTable);
  }
  function generateOutletCode(type) {
    let outlets = [];
    let prefix = "";
    if (type === "wastewater") {
      outlets = wastewaterOutlets.value;
      prefix = "DW";
    } else if (type === "exhaust") {
      outlets = exhaustOutlets.value;
      prefix = "DA";
    } else if (type === "noise") {
      outlets = noiseOutlets.value;
      prefix = "ZS-";
    }
    let maxNum = 0;
    outlets.forEach((outlet) => {
      const match = outlet.code.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum)
          maxNum = num;
      }
    });
    const newNum = maxNum + 1;
    if (type === "noise") {
      return `${prefix}${String(newNum).padStart(2, "0")}`;
    } else {
      return `${prefix}${String(newNum).padStart(3, "0")}`;
    }
  }
  function addOutlet(type, projectId) {
    const code = generateOutletCode(type);
    const newOutlet = {
      id: `outlet_${type}_${Date.now()}`,
      code,
      name: "",
      remark: "",
      images: []
    };
    if (type === "wastewater") {
      wastewaterOutlets.value.push(newOutlet);
    } else if (type === "exhaust") {
      exhaustOutlets.value.push(newOutlet);
    } else if (type === "noise") {
      noiseOutlets.value.push(newOutlet);
    }
    if (projectId) {
      saveOutletList(projectId, wastewaterOutlets.value, exhaustOutlets.value, noiseOutlets.value);
    }
    common_vendor.index.showToast({
      title: "已添加新排污口",
      icon: "success"
    });
  }
  function removeOutlet(type, index, projectId) {
    let outlets = [];
    let typeName = "";
    if (type === "wastewater") {
      outlets = wastewaterOutlets.value;
      typeName = "废水排污口";
    } else if (type === "exhaust") {
      outlets = exhaustOutlets.value;
      typeName = "废气排污口";
    } else if (type === "noise") {
      outlets = noiseOutlets.value;
      typeName = "噪声排污口";
    }
    const outlet = outlets[index];
    common_vendor.index.showModal({
      title: "确认删除",
      content: `确定要删除${typeName} ${outlet.code} 吗？`,
      success: (res) => {
        if (res.confirm) {
          outlets.splice(index, 1);
          if (projectId) {
            saveOutletList(projectId, wastewaterOutlets.value, exhaustOutlets.value, noiseOutlets.value);
          }
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
        }
      }
    });
  }
  function updateOutletData(projectId) {
    if (projectId) {
      saveOutletList(projectId, wastewaterOutlets.value, exhaustOutlets.value, noiseOutlets.value);
    }
  }
  function handleTabChange(index, userId, projectId, baseTable = null) {
    currentTab.value = index;
    if (index === 0 && !constructionList.value.length) {
      fetchConstructionData(userId, projectId);
    }
    if (index === 1 && !equipmentList.value.length) {
      fetchEquipmentData(userId, projectId);
    }
    if (index === 2) {
      loadFacilityList(projectId);
    }
    if (index === 3) {
      loadOutletList(projectId);
    }
  }
  function generateFieldworkComparison(datasheet) {
    const comparison = datasheet.map((item) => ({
      id: Date.now() + Math.random(),
      project: item.label,
      eiaRequirement: item.value || "待确认",
      fieldSituation: "",
      difference: "待现场核实"
    }));
    fieldworkComparison.value = comparison;
    common_vendor.index.showToast({
      title: `功能开发中`,
      icon: "success"
    });
  }
  instance = {
    // Tab相关
    tabs,
    currentTab,
    handleTabChange,
    // 建设内容
    mainContentTable,
    selectModeMain,
    selectedMainIds,
    toggleSelectModeMain,
    toggleSelectedMain,
    removeSelectedMain,
    // 主体工程
    constructionList,
    constructionSearchKeyword,
    filteredConstructionList,
    loadingConstruction,
    fetchConstructionError,
    onConstructionSearchInput,
    fetchConstructionData,
    addConstruction,
    removeConstruction,
    // 设备情况
    equipmentList,
    equipmentSearchKeyword,
    filteredEquipmentList,
    loadingEquipment,
    fetchEquipmentError,
    onEquipmentSearchInput,
    fetchEquipmentData,
    addEquipment,
    removeEquipment,
    // 治理设施（新方法）
    pollutionFacilityList,
    facilitySearchKeyword,
    filteredFacilityList,
    loadingFacility,
    fetchFacilityError,
    onFacilitySearchInput,
    extractFacilitiesFromBaseTable,
    // 新：从baseTable提取
    saveFacilityList,
    // 新：保存到本地
    loadFacilityList,
    // 新：从本地加载
    refreshFacilityData,
    // 新：刷新数据
    updateFacilityData,
    // 新：更新数据
    addPollutionFacility,
    removePollutionFacility,
    // 排污口（新方法）
    wastewaterOutlets,
    exhaustOutlets,
    noiseOutlets,
    extractOutletsFromBaseTable,
    // 新：从baseTable提取
    saveOutletList,
    // 新：保存到本地
    loadOutletList,
    // 新：从本地加载
    refreshOutletData,
    // 新：刷新数据
    updateOutletData,
    // 新：更新数据
    addOutlet,
    removeOutlet,
    // 比对清单
    fieldworkComparison,
    generateFieldworkComparison
  };
  return instance;
}
exports.useFieldSurveyData = useFieldSurveyData;
//# sourceMappingURL=../../.sourcemap/mp-weixin/composables/useFieldSurveyData.js.map
