mergeInto(LibraryManager.library, {
  D6ProbeSend: function (pointer) {
    var message = JSON.parse(UTF8ToString(pointer));
    if (typeof window.D6UnityReceive === 'function') window.D6UnityReceive(message);
  }
});
