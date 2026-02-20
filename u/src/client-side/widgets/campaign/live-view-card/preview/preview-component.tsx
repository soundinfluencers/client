import React from "react";
import previewFallback from "@/assets/icons/video (1).png";
import { getFilePreview } from "@/api/client/preview/preview.api";
import { LoaderPreview } from "@/components/ui/loader-preview/loader";
import play from "@/assets/icons/play.svg";
interface PreviewVideoProps {
  previewUrl?: string | null; // если уже есть url
  pathLower?: string;
  fileId?: string;
}

export const PreviewPhoto: React.FC<PreviewVideoProps> = ({
  previewUrl,
  pathLower,
  fileId,
}) => {
  const [url, setUrl] = React.useState<string | null>(previewUrl ?? null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (previewUrl) return;
    if (!pathLower || !fileId) return;

    let objectUrl: string;

    const loadPreview = async () => {
      try {
        setLoading(true);

        const blob = await getFilePreview({
          provider: "dropbox",
          pathLower,
          fileId,
          sizeTag: "w480h320",
        });

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewUrl, pathLower, fileId]);

  return (
    <div className="video">
      {url && (
        <div className="video-play">
          <div className="video-play__play">
            <img src={play} alt="" />
          </div>
        </div>
      )}
      {loading ? (
        <LoaderPreview />
      ) : url && !error ? (
        <img src={url} alt="preview" />
      ) : (
        <img src={previewFallback} alt="no preview" />
      )}
    </div>
  );
};
