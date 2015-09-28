component {


	public function errorResponse(error) {
		var errorMsg = 'Default Error Message';
		if (isStruct(arguments.error)) {
			if (StructKeyExists(arguments.error,'cause') AND StructKeyExists(arguments.error.cause,'message')) {
				errorMsg = arguments.error.cause.message;
			} else {
				errorMsg = arguments.error.message;
			}

		} else if (isSimpleValue(arguments.error)) {
			errorMsg = arguments.error;
		}

		setServerStatus(500,errorMsg);
	}

	public function setServerStatus(statusCode,statusMsg) {
		var pageContext = getpagecontext();
		pageContext.getresponse().setstatus(arguments.statusCode,arguments.statusMsg);
	}

	public function applyHeaders() {

		var headerContent = toString(getHTTPRequestData().content);
		
		if (!Len(headerContent)) {
			headerContent = StructNew();
		} else if (isJson(headerContent)) {
			headerContent = deserializeJSON(headerContent);
		}
		
		return headerContent;
	}

}