import Component from "@glimmer/component";
import { getOwner } from "@ember/owner";
import { service } from "@ember/service";
import UppyUpload from "discourse/lib/uppy/uppy-upload";
import DButton from "discourse/ui-kit/d-button";
import DPickFilesButton from "discourse/ui-kit/d-pick-files-button";
import { i18n } from "discourse-i18n";
import { AUDIO_FORMATS, audioMarkdown, insertAudioIntoBody, isAudioFile } from "../lib/audio-body";

export default class TopicAudioUploader extends Component {
  @service dialog;

  static shouldRender(args, { siteSettings }) {
    return siteSettings.topic_audio_enabled && args.model?.canEditTitle &&
      !args.model?.creatingPrivateMessage;
  }

  get composer() {
    return this.args.outletArgs.model;
  }

  get acceptedFormats() {
    return AUDIO_FORMATS;
  }

  get busy() {
    return this.uploader.uploading || this.uploader.processing;
  }

  uploader = new UppyUpload(getOwner(this), {
    id: "topic-audio-upload",
    type: "composer",
    maxFiles: 1,
    validateUploadedFilesOptions: { bypassNewUserRestriction: false },
    isUploadedFileAllowed: (file) => {
      if (isAudioFile(file)) {
        return true;
      }
      this.dialog.alert(i18n("topic_audio.invalid"));
      return false;
    },
    uploadDone: (upload) => {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }
      this.composer.set("reply", insertAudioIntoBody(
        this.composer.reply,
        audioMarkdown(upload, i18n("topic_audio.label"))
      ));
    },
  });

  willDestroy() {
    this.uploader.teardown();
    super.willDestroy(...arguments);
  }

  <template>
    <div class="topic-audio-field">
      <DPickFilesButton
        @registerFileInput={{this.uploader.setup}}
        @fileInputDisabled={{this.busy}}
        @acceptedFormatsOverride={{this.acceptedFormats}}
        @fileInputId="topic-audio-file"
      />
      <DButton
        @action={{this.uploader.openPicker}}
        @label="topic_audio.upload"
        @disabled={{this.busy}}
        class="btn-default btn-small topic-audio-upload-button"
      />
      <span class="topic-audio-field__help" role="status" title={{i18n "topic_audio.help"}}>
        {{#if this.busy}}
          {{i18n "topic_audio.uploading"}} {{this.uploader.uploadProgress}}%
        {{else}}
          {{i18n "topic_audio.help"}}
        {{/if}}
      </span>
    </div>
  </template>
}
