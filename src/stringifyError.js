function getErrorMessage(err) {
  if (err.message) return err.message;
  if (typeof err.error === "string") return err.error;
  if (typeof err.error_summary === "string") return err.error_summary;
  if (err.error && typeof err.error.error_summary === "string")
    return err.error.error_summary;
  return "Unkown error.";
}

export default function stringifyError(err, description) {
  const msg = getErrorMessage(err);
  if (description)
    return `The follow error happened while ${description}:\n\n${msg}`;
  return msg;
}
