export default {
  newResponse: (data = null, success = true, errorMsg = '') => {
    return {
      success: success,
      errorMsg: errorMsg,
      data: data
    }
  }
}