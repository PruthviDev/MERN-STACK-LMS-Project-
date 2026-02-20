import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload } from "lucide-react";
import { useContext, useRef } from "react";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);

  function handleNewLecture() {
    setCourseCurriculumFormData((prev) => [
      ...prev,
      { ...courseCurriculumInitialFormData[0] },
    ]);
  }

  function handleCourseTitleChange(event, index) {
    setCourseCurriculumFormData((prev) => {
      const cpy = [...prev];
      cpy[index] = { ...cpy[index], title: event.target.value };
      return cpy;
    });
  }

  function handleFreePreviewChange(value, index) {
    setCourseCurriculumFormData((prev) => {
      const cpy = [...prev];
      cpy[index] = { ...cpy[index], freePreview: value };
      return cpy;
    });
  }

  async function handleSingleLectureUpload(event, index) {
    console.log(event.target.files);
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);


    try {
      setMediaUploadProgress(true);

      const response = await mediaUploadService(
        formData,
        setMediaUploadProgressPercentage
      );

      if (response?.success) {
        setCourseCurriculumFormData((prev) => {
          const cpy = [...prev];
          cpy[index] = {
            ...cpy[index],
            videoUrl: response.data.url,
            public_id: response.data.public_id,
          };
          return cpy;
        });
      }
    } catch (err) {
      console.error(err);
      console.log("Error in single lecture upload", err);
    } finally {
      setMediaUploadProgress(false);
    }
  }

  async function handleReplaceVideo(index) {
    const publicId = courseCurriculumFormData[index]?.public_id;
    if (!publicId) return;

    try {
      await mediaDeleteService(publicId);

      setCourseCurriculumFormData((prev) => {
        const cpy = [...prev];
        cpy[index] = { ...cpy[index], videoUrl: "", public_id: "" };
        return cpy;
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteLecture(index) {
    const publicId = courseCurriculumFormData[index]?.public_id;

    try {
      if (publicId) await mediaDeleteService(publicId);

      setCourseCurriculumFormData((prev) =>
        prev.filter((_, i) => i !== index)
      );
    } catch (err) {
      console.error(err);
    }
  }

  function isCourseCurriculumFormDataValid() {
    return courseCurriculumFormData.every(
      (item) =>
        item?.title?.trim() !== "" && item?.videoUrl?.trim() !== ""
    );
  }

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllObjectsEmpty(arr) {
    return arr.every((obj) =>
      Object.values(obj).every((val) =>
        typeof val === "boolean" ? true : val === ""
      )
    );
  }

  async function handleMediaBulkUpload(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setMediaUploadProgress(true);

      const response = await mediaBulkUploadService(
        formData,
        setMediaUploadProgressPercentage
      );

      if (response?.success) {
        setCourseCurriculumFormData((prev) => {
          const base = areAllObjectsEmpty(prev) ? [] : [...prev];

          const mapped = response.data.map((item, i) => ({
            videoUrl: item.url,
            public_id: item.public_id,
            title: `Lecture ${base.length + i + 1}`,
            freePreview: false,
          }));

          return [...base, ...mapped];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMediaUploadProgress(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Create Course Curriculum</CardTitle>

        <div>
          <Input
            ref={bulkUploadInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleMediaBulkUpload}
          />
          <Button variant="outline" onClick={handleOpenBulkUploadDialog}>
            <Upload className="w-4 h-5 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Button
          disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
          onClick={handleNewLecture}
        >
          Add Lecture
        </Button>

        {mediaUploadProgress && (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        )}

        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((item, index) => (
            <div
              key={item.public_id || index}   // ✅ FIXED KEY
              className="border p-5 rounded-md"
            >
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Lecture {index + 1}</h3>

                <Input
                  placeholder="Enter lecture title"
                  className="max-w-96"
                  value={item.title}
                  onChange={(e) => handleCourseTitleChange(e, index)}
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={item.freePreview}
                    onCheckedChange={(val) =>
                      handleFreePreviewChange(val, index)
                    }
                  />
                  <Label>Free Preview</Label>
                </div>
              </div>

              <div className="mt-6">
                {item.videoUrl ? (
                  <div className="flex gap-3">
                    <VideoPlayer
                      url={item.videoUrl}
                      width="450px"
                      height="200px"
                    />
                    <Button onClick={() => handleReplaceVideo(index)}>
                      Replace Video
                    </Button>
                    <Button
                      className="bg-red-900"
                      onClick={() => handleDeleteLecture(index)}
                    >
                      Delete Lecture
                    </Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleSingleLectureUpload(e, index)
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;

