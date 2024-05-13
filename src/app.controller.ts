import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller()
@ApiTags('files')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('merge-by-id')
  @ApiOperation({
    operationId: 'mergeTwoFilesById',
    summary: 'Merge 2 json files with transaction data',
    description: 'Transactions with the same id will be merged into one',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful',
    type: String,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple files',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array', // 👈  array of files
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async mergeTwoFilesById(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ) {
    const [firstFile, secondFile] = files;
    const transactionDataOne = JSON.parse(firstFile.buffer.toString());
    const transactionDataTwo = JSON.parse(secondFile.buffer.toString());
    try {
      const result = await this.appService.mergeTwoFiles(
        transactionDataOne,
        transactionDataTwo,
        'id',
      );
      return res.download(
        result,
        "Merged transactions",
        null,
        async (err) => {
          if (err) {
            throw new Error(`Merge two files failed with error ${err}`);
          }
        },
      );
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, error: error.message || error });
    }
  }
}
