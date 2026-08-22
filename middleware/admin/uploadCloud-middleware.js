const uploadToCloudinary = require("../../helpers/upload-cloudinary");

// Hàm cũ: Dành cho upload 1 file (upload.single)
module.exports.upload = async (req, res, next) => {
  try {
    if (req.file) {
      const link = await uploadToCloudinary(req.file.buffer);
      req.body[req.file.fieldname] = link;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports.uploadFields = async (req, res, next) => {
  try {
    if (req.files) {
      if (typeof req.files === 'object' && !Array.isArray(req.files)) {
        for (const fieldname in req.files) {
          const fileArray = req.files[fieldname];
          if (fileArray && fileArray.length > 0) {
            const uploadPromises = fileArray.map(file => uploadToCloudinary(file.buffer));
            const links = await Promise.all(uploadPromises);
            req.body[fieldname] = links; 
          }
        }
      } 
      else if (Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        const links = await Promise.all(uploadPromises);
        
        const fieldname = req.files[0].fieldname;
        req.body[fieldname] = links;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};