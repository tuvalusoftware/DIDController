import { NextFunction, Request, Response } from "express";
import { handleMongoError } from "../../errors/errorHandlers";
import { DidDocRepository } from "../../db/mongo/repos/DidDoc.repo";
import { DocRepository } from "../../db/mongo/repos/Doc.repo";
import { CompanyRepository } from "../../db/mongo/repos/Company.repo";
import { validateRequestInputSchema } from "../../helpers/utils";
import { z } from "zod";
import {
  WrappedDocCreationRequestBody,
  wrappedDocBodySchema,
} from "../../schemas/doc.schema";
import { ERROR_CODES } from "../../errors/errorCodes";
import { OPERATION_CODES } from "../../constants/common";
import { AppError } from "../../errors/AppError";
import Logger from "../../libs/Logger";

export default {
  isExist: async (
    req: Request<{}, {}, {}, { companyName: string; fileName: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { companyName, fileName } = validateRequestInputSchema(
        z.object({
          companyName: z.string().min(2),
          fileName: z.string().min(2),
        }),
        req.query
      );
      const company = await CompanyRepository.findByNameOrFail(companyName);
      const isExisted = await DocRepository.isExist(fileName, company);
      return res.status(200).json({ isExisted });
    } catch (error: any) {
      return next(handleMongoError(error));
    }
  },
  getDoc: async (
    req: Request<
      {},
      {},
      {},
      { companyName: string; fileName: string; only: string }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { companyName, fileName, only } = validateRequestInputSchema(
        z.object({
          companyName: z.string().nonempty(),
          fileName: z.string().min(2),
          only: z.string().optional(),
        }),
        req.query
      );
      const company = await CompanyRepository.findByNameOrFail(companyName);

      if (only === "doc") {
        const wrappedDoc = await DocRepository.findByCompanyAndFileName(
          fileName,
          company
        );
        return res.status(200).json({
          wrappedDoc: wrappedDoc.content,
        });
      } else if (only === "did") {
        const didDoc = await DidDocRepository.findByCompanyAndFileName(
          fileName,
          company
        );
        return res.status(200).json({
          didDoc: didDoc,
        });
      }
      // Get both
      const [wrappedDoc, didDoc] = await Promise.all([
        DocRepository.findByCompanyAndFileName(fileName, company),
        DidDocRepository.findByCompanyAndFileName(fileName, company),
      ]);
      return res.status(200).json({
        wrappedDoc: wrappedDoc.content,
        didDoc: didDoc,
      });
    } catch (error: any) {
      return next(handleMongoError(error));
    }
  },
  getDocsByUser: async (
    req: Request<{}, {}, {}, { companyName: string; publicKey: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { companyName, publicKey } = validateRequestInputSchema(
        z.object({
          companyName: z.string().nonempty(),
          publicKey: z.string().min(2),
        }),
        req.query
      );
      const company = await CompanyRepository.findByNameOrFail(companyName);
      const didDocsBelongToCompany = await DidDocRepository.findByCompany(
        company
      );
      const didDocsBelongToUser = didDocsBelongToCompany.filter(
        (didDoc) => didDoc.holder === publicKey || didDoc.owner === publicKey
      );
      const documents = await Promise.all(
        didDocsBelongToUser.map(async (didDoc) => {
          const wrappedDoc = await DocRepository.findByDidDocAndCompany(
            company,
            didDoc
          );
          return wrappedDoc.content;
        })
      );
      return res.status(200).json(documents);
    } catch (error: any) {
      return next(handleMongoError(error));
    }
  },
  deleteDoc: async (
    req: Request<{}, {}, {}, { companyName: string; fileName: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { companyName, fileName } = validateRequestInputSchema(
        z.object({
          companyName: z.string().nonempty(),
          fileName: z.string().min(2),
        }),
        req.query
      );
      const company = await CompanyRepository.findByNameOrFail(companyName);
      await DocRepository.deleteDoc(fileName, company);
      return res.status(200).json(OPERATION_CODES.DELETE_SUCCESS);
    } catch (error: any) {
      return next(handleMongoError(error));
    }
  },
  createDoc: async (
    req: Request<{}, {}, WrappedDocCreationRequestBody, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { wrappedDocument, fileName, companyName } =
        validateRequestInputSchema(wrappedDocBodySchema, req.body);
      const isCloned = req.route.path === "/clone";
      Logger.apiInfo(
        req,
        !isCloned ? `CREATE A NEW DOCUMENT` : `CLONE A NEW DOCUMENT`
      );
      const company = await CompanyRepository.findOrCreateCompanyByName(
        companyName
      );
      const ownerDid = wrappedDocument?.data?.issuers[0]?.address;
      if (!ownerDid) throw new AppError(ERROR_CODES.INVALID_WRAPPED_DOCUMENT);
      const targetHash = wrappedDocument?.signature?.targetHash;
      if (!targetHash) throw new AppError(ERROR_CODES.INVALID_WRAPPED_DOCUMENT);
      const ownerPublicKey =
        ownerDid.split(":")[ownerDid.split(":")?.length - 1];
      const didDocDid = `did:${companyName}:${ownerPublicKey}:${targetHash}`;
      const didDocExist = await DidDocRepository.isExists(didDocDid, company);
      if (didDocExist) throw new AppError(ERROR_CODES.FILE_EXISTED);
      const didDoc = await DidDocRepository.createDicDoc({
        company,
        controller: [ownerPublicKey],
        did: `did:${companyName}:${ownerPublicKey}:${targetHash}`,
        owner: ownerPublicKey,
        holder: ownerPublicKey,
        url: fileName,
      });
      await DocRepository.createDoc({
        didDoc,
        content: wrappedDocument,
        fileName,
        company,
      });
      res
        .status(201)
        .json(
          !isCloned
            ? OPERATION_CODES.SAVE_SUCCESS
            : OPERATION_CODES.CLONE_SUCCESS
        );
    } catch (error: any) {
      return next(handleMongoError(error));
    }
  },
};
