import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// create layout
export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      console.log("Creating layout with type:", type);

      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} already exists`, 400));
      }

      switch (type) {
        case "Banner":
          const { image, title, subTitle } = req.body;
          const myCloud = await cloudinary.v2.uploader.upload(image, {
            folder: "layout",
          });
          const banner = {
            type: "Banner",
            banner: {
              image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              },
              title,
              subTitle,
            },
          };
          await LayoutModel.create(banner);
          break;

        case "FAQ":
          const { faq } = req.body;
          const faqItems = faq.map((item: any) => ({
            question: item.question,
            answer: item.answer,
          }));
          await LayoutModel.create({ type: "FAQ", faq: faqItems });
          break;

        case "Categories":
          const { categories } = req.body;
          const categoriesItems = categories.map((item: any) => ({
            title: item.title,
          }));
          await LayoutModel.create({
            type: "Categories",
            categories: categoriesItems,
          });
          break;

        default:
          return next(new ErrorHandler("Invalid layout type", 400));
      }

      res.status(200).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      console.error("Error creating layout:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit layout
export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      console.log("Editing layout with type:", type);

      switch (type) {
        case "Banner":
          const bannerData: any = await LayoutModel.findOne({ type: "Banner" });
          if (!bannerData) {
            return next(new ErrorHandler("Banner layout not found", 404));
          }
          const { image, title, subTitle } = req.body;
          const data = image.startsWith("https")
            ? bannerData
            : await cloudinary.v2.uploader.upload(image, { folder: "layout" });
          const banner = {
            type: "Banner",
            banner: {
              image: {
                public_id: image.startsWith("https")
                  ? bannerData.banner.image.public_id
                  : data.public_id,
                url: image.startsWith("https")
                  ? bannerData.banner.image.url
                  : data.secure_url,
              },
              title,
              subTitle,
            },
          };
          await LayoutModel.findByIdAndUpdate(bannerData._id, banner);
          break;

        case "FAQ":
          const faqData = await LayoutModel.findOne({ type: "FAQ" });
          if (!faqData) {
            return next(new ErrorHandler("FAQ layout not found", 404));
          }
          const { faq } = req.body;
          const faqItems = faq.map((item: any) => ({
            question: item.question,
            answer: item.answer,
          }));
          await LayoutModel.findByIdAndUpdate(faqData._id, {
            type: "FAQ",
            faq: faqItems,
          });
          break;

        case "Categories":
          const categoriesData = await LayoutModel.findOne({
            type: "Categories",
          });
          if (!categoriesData) {
            return next(new ErrorHandler("Categories layout not found", 404));
          }
          const { categories } = req.body;
          const categoriesItems = categories.map((item: any) => ({
            title: item.title,
          }));
          await LayoutModel.findByIdAndUpdate(categoriesData._id, {
            type: "Categories",
            categories: categoriesItems,
          });
          break;

        default:
          return next(new ErrorHandler("Invalid layout type", 400));
      }

      res.status(200).json({
        success: true,
        message: "Layout updated successfully",
      });
    } catch (error: any) {
      console.error("Error editing layout:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get layout by type
export const getLayoutByType = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      console.log("Getting layout with type:", type);

      const layout = await LayoutModel.findOne({ type });
      if (!layout) {
        return next(new ErrorHandler("Layout not found", 404));
      }

      res.status(200).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      console.error("Error getting layout:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
