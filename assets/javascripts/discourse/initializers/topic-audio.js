import { apiInitializer } from "discourse/lib/api";
import TopicAudioUploader from "../components/topic-audio-uploader";

export default apiInitializer("1.34.0", (api) => {
  // Programmatic connectors follow the existing file-based cover connector.
  api.renderInOutlet("after-title-and-category", TopicAudioUploader);
});
