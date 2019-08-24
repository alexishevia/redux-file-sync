export default function MemoryLocalStorage() {
  let text = "";

  function read() {
    return Promise.resolve(text);
  }

  function write(key, newText) {
    text = newText;
    return Promise.resolve();
  }

  function reset() {
    text = "";
    return Promise.resolve();
  }

  return { read, write, reset };
}
