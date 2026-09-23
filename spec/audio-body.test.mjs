import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = await readFile(new URL("../assets/javascripts/discourse/lib/audio-body.js", import.meta.url), "utf8");
const { insertAudioIntoBody, audioMarkdown, isAudioFile } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const audio = "![语音|audio](upload://voice.mp3)";

test("audio follows cover and preserves article", () => {
  assert.equal(insertAudioIntoBody("![topic-cover-12](upload://cover.jpg)\n\n正文\n第二行", audio), "![topic-cover-12](upload://cover.jpg)\n\n" + audio + "\n\n正文\n第二行");
});
test("empty composer ends with a fresh paragraph", () => {
  assert.equal(insertAudioIntoBody("", audio), audio + "\n\n");
});
test("upload before cover preserves existing text", () => {
  assert.equal(insertAudioIntoBody("正文", audio), audio + "\n\n正文");
});
test("existing audio and other attachments are retained", () => {
  assert.equal(insertAudioIntoBody(audio + "\n\n[文档](upload://a.pdf)", audio), audio + "\n\n" + audio + "\n\n[文档](upload://a.pdf)");
});
test("CRLF cover is recognized without rewriting article whitespace", () => {
  assert.equal(insertAudioIntoBody("![topic-cover-12](upload://cover.jpg)\r\n\r\n    code", audio), "![topic-cover-12](upload://cover.jpg)\n\n" + audio + "\n\n    code");
});
test("markdown uses upload short URL and safely encodes URL delimiters", () => {
  assert.equal(audioMarkdown({ short_url: "upload://voice.mp3", url: "/other.mp3" }), audio);
  assert.equal(audioMarkdown({ url: "/uploads/a (1).mp3" }), "![语音|audio](/uploads/a%20%281%29.mp3)");
});
test("only supported audio extensions accepted, including uppercase", () => {
  assert.equal(isAudioFile({ name: "录音.M4A" }), true);
  assert.equal(isAudioFile({ name: "photo.png", type: "audio/mpeg" }), false);
});
