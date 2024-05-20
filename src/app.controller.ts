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
@ApiTags('WorkingWithFiles')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('merge-files')
  @ApiOperation({
    operationId: 'mergeTwoFilesById',
    summary: 'Merge 2 json files with transaction data',
    description:
      'Merge transaction data with membership data using userId as the reference field',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful',
    type: String,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple files',
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
    const [transactionsFile, membershipFile] = files;
    const transactions = JSON.parse(transactionsFile.buffer.toString());
    const memberships = JSON.parse(membershipFile.buffer.toString());
    try {
      const result = await this.appService.mergeTwoFiles(
        transactions,
        memberships,
      );
      return res.download(result, 'Merged transactions', null, async (err) => {
        if (err) {
          throw new Error(`Merge two files failed with error ${err}`);
        }
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, error: error.message || error });
    }
  }
}
