import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = await readFile(new URL("../assets/javascripts/discourse/lib/audio-body.js", import.meta.url), "utf8");
const { audioFilename, audioFilenameFromBody, insertAudioIntoBody, audioMarkdown, isAudioFile } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const audio = "![topic-audio-42 voice.mp3|audio](upload://voice.mp3)";

test("audio follows cover and preserves article", () => {
  assert.equal(insertAudioIntoBody("![topic-cover-12](upload://cover.jpg)\n\n正文\n第二行", audio).raw, "![topic-cover-12](upload://cover.jpg)\n\n" + audio + "\n\n正文\n第二行");
});
test("empty composer ends with a fresh paragraph", () => {
  assert.equal(insertAudioIntoBody("", audio).raw, audio + "\n\n");
});
test("upload before cover preserves existing text", () => {
  assert.equal(insertAudioIntoBody("正文", audio).raw, audio + "\n\n正文");
});
test("re-upload replaces the previous field audio and retains other attachments", () => {
  const oldAudio = "![topic-audio-17 old.mp3|audio](upload://old.mp3)";
  assert.equal(insertAudioIntoBody(oldAudio + "\n\n[文档](upload://a.pdf)", audio).raw, audio + "\n\n[文档](upload://a.pdf)");
});
test("ordinary audio elsewhere in the article is retained", () => {
  const ordinaryAudio = "![采访录音|audio](upload://interview.mp3)";
  assert.equal(insertAudioIntoBody("正文\n\n" + ordinaryAudio, audio).raw, audio + "\n\n正文\n\n" + ordinaryAudio);
});
test("legacy field audio in the reserved position is upgraded and replaced", () => {
  const legacy = "![语音|audio](upload://old.mp3)";
  assert.equal(insertAudioIntoBody("![topic-cover-12](upload://cover.jpg)\n\n" + legacy + "\n\n正文", audio).raw, "![topic-cover-12](upload://cover.jpg)\n\n" + audio + "\n\n正文");
});
test("CRLF cover is recognized without rewriting article whitespace", () => {
  assert.equal(insertAudioIntoBody("![topic-cover-12](upload://cover.jpg)\r\n\r\n    code", audio).raw, "![topic-cover-12](upload://cover.jpg)\n\n" + audio + "\n\n    code");
});
test("markdown uses upload short URL and safely encodes URL delimiters", () => {
  assert.equal(audioMarkdown({ id: 42, original_filename: "voice.mp3", short_url: "upload://voice.mp3", url: "/other.mp3" }), audio);
  assert.equal(audioMarkdown({ id: 7, name: "a (1).mp3", url: "/uploads/a (1).mp3" }), "![topic-audio-7 a (1).mp3|audio](/uploads/a%20%281%29.mp3)");
});
test("filename updates from upload response and can be restored from the body", () => {
  assert.equal(audioFilename({ original_filename: "new.mp3", name: "fallback.mp3" }), "new.mp3");
  assert.equal(audioFilename({ name: "fallback.m4a" }), "fallback.m4a");
  assert.equal(audioFilenameFromBody(audio), "voice.mp3");
  assert.equal(audioFilenameFromBody("![topic-audio-7|audio](upload://old.mp3)"), "");
});
test("only supported audio extensions accepted, including uppercase", () => {
  assert.equal(isAudioFile({ name: "录音.M4A" }), true);
  assert.equal(isAudioFile({ name: "photo.png", type: "audio/mpeg" }), false);
});

test("replacing a deduplicated upload uses each newly selected filename", () => {
  const storedUpload = { id: 42, short_url: "upload://voice.mp3", original_filename: "first.mp3" };
  let body = "正文";
  for (const filename of ["second.mp3", "第三段.mp3"]) {
    const upload = { ...storedUpload, file_name: filename };
    body = insertAudioIntoBody(body, audioMarkdown(upload)).raw;
    assert.equal(audioFilename(upload), filename);
    assert.equal(audioFilenameFromBody(body), filename);
    assert.equal((body.match(/\|audio\]/g) || []).length, 1);
    assert.ok(body.endsWith("正文"));
  }
});
