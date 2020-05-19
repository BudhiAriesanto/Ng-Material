/**
 * @private
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
export default function getRecognizerByNameIfManager(otherRecognizer: any, recognizer: any) {
  let { manager } = recognizer;
  if (manager) {
    return manager.get(otherRecognizer);
  }
  return otherRecognizer;
}
