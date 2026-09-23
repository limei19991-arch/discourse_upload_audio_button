export const AUDIO_FORMATS = ".mp3,.m4a,.wav,.ogg,.oga,.aac,.flac";

export function isAudioFile(file) {
  return /\.(mp3|m4a|wav|ogg|oga|aac|flac)$/i.test(file.name || "");
}

export function audioFilename(upload) {
  // Uppy supplies the current selection as file_name. The server may reuse
  // an upload whose original_filename belongs to an earlier selection.
  return upload.file_name || upload.original_filename || upload.name ||
    upload.filename || "";
}

export function audioMarkdown(upload) {
  const url = (upload.short_url || upload.url).replace(/[\s()<>]/g, (character) =>
    encodeURIComponent(character).replace(/\(/g, "%28").replace(/\)/g, "%29")
  );
  const marker = upload.id ? `topic-audio-${upload.id}` : "topic-audio";
  const filename = audioFilename(upload).replace(/[\[\]\r\n|]/g, " ").trim();
  return `![${marker}${filename ? ` ${filename}` : ""}|audio](${url})`;
}

export function audioFilenameFromBody(raw) {
  const match = (raw || "").match(
    /^!\[topic-audio(?:-\d+)?(?: ([^\]\r\n|]+))?\|audio\]/m
  );
  return match?.[1]?.trim() || "";
}

export function insertAudioIntoBody(raw, markdown, previousMarkdown) {
  let body = raw || "";

  // Remove only audio inserted through this field. Other audio in the article is kept.
  body = body.replace(
    /^!\[topic-audio(?:-\d+)?(?: [^\]\r\n|]+)?\|audio\]\([^()\r\n]+\)[ \t]*(?:\r?\n)?/gm,
    ""
  );
  if (previousMarkdown) {
    body = body.split(previousMarkdown).join("");
  }

  const cover = body.match(/^(!\[topic-cover-\d+\]\([^()\r\n]+\))[ \t]*(?:\r?\n|$)/);
  if (cover) {
    let remaining = body.slice(cover[0].length).replace(/^(?:[ \t]*\r?\n)+/, "");

    // Upgrade the unmarked format used by older releases, but only in its
    // reserved position directly below the cover.
    remaining = remaining.replace(
      /^!\[(?:语音|Audio)\|audio\]\([^()\r\n]+\)[ \t]*(?:\r?\n|$)/,
      ""
    ).replace(/^(?:[ \t]*\r?\n)+/, "");

    return { raw: `${cover[1]}\n\n${markdown}\n\n${remaining}`, markdown };
  }

  body = body.replace(/^(?:[ \t]*\r?\n)+/, "");
  body = body.replace(
    /^!\[(?:语音|Audio)\|audio\]\([^()\r\n]+\)[ \t]*(?:\r?\n|$)/,
    ""
  ).replace(/^(?:[ \t]*\r?\n)+/, "");

  return { raw: `${markdown}\n\n${body}`, markdown };
}
