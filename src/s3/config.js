import axios from "axios";

// Upload an image through the backend API (no auth token required).
export const uploadImage = async (file, uploadType = 'device') => {
  console.log('4. uploadImage function called');
  const fileName =
    uploadType === 'edited'
      ? `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      : `${Date.now()}-${file.name}`;

  const renamedFile = new File([file], fileName, {
    type: file.type,
  });
  const formData = new FormData();
  formData.append('image', renamedFile);

  console.log('fileName of img - ', renamedFile);

  const response = await axios.post(
    'https://betaapi.s2w.com.au/image/s2w/upload',
    formData
  );

  const imageUrl = response?.data?.data?.imageUrl;

  if (!response?.data?.success || !imageUrl) {
    throw new Error(response?.data?.message || 'Image upload failed');
  }

  return imageUrl;
};

