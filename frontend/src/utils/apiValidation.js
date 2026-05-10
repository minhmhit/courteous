const toArray = (value) => (Array.isArray(value) ? value : []);

export const getApiValidationItems = (error) => {
  if (!error) return [];

  const directItems = [
    ...toArray(error.errors),
    ...toArray(error.details),
  ];

  if (directItems.length > 0) {
    return directItems;
  }

  const responseData = error.response?.data;
  return [
    ...toArray(responseData?.errors),
    ...toArray(responseData?.details),
  ];
};

export const getApiFieldErrors = (error, fieldMap = {}) => {
  const items = getApiValidationItems(error);

  return items.reduce((acc, item) => {
    const rawField = item?.path || item?.param || item?.field;
    const message = item?.msg || item?.message;

    if (!rawField || !message) {
      return acc;
    }

    const mappedField = fieldMap[rawField] || rawField;
    if (!acc[mappedField]) {
      acc[mappedField] = message;
    }

    return acc;
  }, {});
};

export const getApiErrorMessage = (error, fallbackMessage = "Co loi xay ra") => {
  const items = getApiValidationItems(error);
  const firstValidationMessage = items[0]?.msg || items[0]?.message;

  if (firstValidationMessage) {
    return firstValidationMessage;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallbackMessage
  );
};

export const hasApiValidationErrors = (error) => getApiValidationItems(error).length > 0;
