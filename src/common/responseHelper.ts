export default {
  newResponse: (data = null, success = true, errorMsg = '') => {
    return {
      success,
      errorMsg,
      data,
    };
  },
};
