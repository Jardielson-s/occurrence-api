import { Request, Response } from "express";
import { IController } from "../shared/interfaces/IController";

export const adapterRoutes = (controller: IController) => {
  return async (req: Request, res: Response) => {
    const requestParams = {
      ...req.params,
      ...req.query,
    };
    const httpResponse = await controller.handler({
      requestBody: req.body,
      requestParams,
    });
    return res.status(httpResponse.status).json(httpResponse.body);
  };
};
