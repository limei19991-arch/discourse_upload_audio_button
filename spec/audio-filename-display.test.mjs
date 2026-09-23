import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const lib = await readFile(new URL("../assets/javascripts/discourse/lib/audio-body.js", import.meta.url), "utf8");
const { audioFilenameFromBody } = await import(`data:text/javascript;base64,${Buffer.from(lib).toString("base64")}`);
const component = await readFile(new URL("../assets/javascripts/discourse/components/topic-audio-uploader.gjs", import.meta.url), "utf8");
// Execute the production getter without needing to compile its GJS template.
const getter = component.match(/get uploadedFilename\(\) \{([\s\S]*?)\n  \}/)[1];
const readFilename = new Function("audioFilenameFromBody", getter);

test("display follows current reply even when a previous filename remains on the composer", () => {
  const composer = {
    topicAudioFilename: "first.mp3",
    reply: "![topic-audio-1 first.mp3|audio](upload://first.mp3)\n\n正文",
  };
  const display = () => readFilename.call({ composer }, audioFilenameFromBody);
  assert.equal(display(), "first.mp3");
  composer.reply = "![topic-audio-2 second.mp3|audio](upload://second.mp3)\n\n正文";
  assert.equal(display(), "second.mp3");
  composer.reply = "正文";
  assert.equal(display(), "");
});
