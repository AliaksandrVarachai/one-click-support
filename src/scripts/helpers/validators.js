export function validateFormFields(fields) {
  const result = {
    valid: true,
    message: [],
  }

  if (!fields.title || !fields.title.trim()) {
    result.valid = false;
    result.message.push('Title is required.');
  }

  if (!fields.description || !fields.description.trim()) {
    result.valid = false;
    result.message.push('Description is required.');
  }

  return result;
}