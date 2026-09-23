export const AUDIO_FORMATS = ".mp3,.m4a,.wav,.ogg,.oga,.aac,.flac";

export function isAudioFile(file) {
  return /\.(mp3|m4a|wav|ogg|oga|aac|flac)$/i.test(file.name || "");
}

export function audioMarkdown(upload, label = "语音") {
  const url = (upload.short_url || upload.url).replace(/[\s()<>]/g, (character) =>
    encodeURIComponent(character).replace(/\(/g, "%28").replace(/\)/g, "%29")
  );
  return `![${label.replace(/[\[\]\r\n|]/g, " ")}|audio](${url})`;
}

export function insertAudioIntoBody(raw, markdown) {
  const body = raw || "";
  const cover = body.match(/^(!\[topic-cover-\d+\]\([^()\r\n]+\))[ \t]*(?:\r?\n|$)/);
  if (cover) {
    const remaining = body.slice(cover[0].length).replace(/^(?:[ \t]*\r?\n)+/, "");
    return `${cover[1]}\n\n${markdown}\n\n${remaining}`;
  }
  return `${markdown}\n\n${body}`;
}
