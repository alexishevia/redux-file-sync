export default function MemoryLocalStorage() {
  let text = "";

  function getItem() {
    return Promise.resolve(text);
  }

  function setItem(key, newText) {
    text = newText;
    return Promise.resolve();
  }

  return { getItem, setItem };
}
