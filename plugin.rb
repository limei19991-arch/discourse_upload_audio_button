# frozen_string_literal: true

# name: discourse-topic-audio
# about: Upload audio into the topic body directly below its cover.
# version: 0.1.5
# authors: rio
# required_version: 3.5.0

enabled_site_setting :topic_audio_enabled
register_asset "stylesheets/common/topic-audio.scss"
