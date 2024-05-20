import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { ExcelUtil } from '../utils/excel.util';
import { ReportData } from './app.interface';
@Injectable()
export class AppService {
  async mergeTwoFiles(transactions, memberships) {
    const result = [];
    transactions.forEach((txn) => {
      const membership = memberships.find((mbs) => mbs.userId === txn.userId);
      if (membership) {
        const reportData = {
          ...txn,
          membershipId: membership.memberShipId,
        };
        result.push(reportData);
      }
    });
    return this.generateReport(result);
  }

  async generateReport(reportData: ReportData[]) {
    const getTemplateDir = () => {
      return join(
        __dirname,
        '../../',
        'xlsx-templates',
        'transaction_template.xlsx',
      );
    };
    const excelUtil = new ExcelUtil();
    try {
      await excelUtil.loadFile(getTemplateDir(), 1);

      reportData.forEach((data, index) => {
        excelUtil.setCellValue(data.userId, `A${index + 2}`);
        excelUtil.setCellValue(data.userName, `B${index + 2}`);
        excelUtil.setCellValue(data.membershipId, `C${index + 2}`);
        excelUtil.setCellValue(data.vehiclePlateNumber, `D${index + 2}`);
        excelUtil.setCellValue(data.totalVolume, `E${index + 2}`);
        excelUtil.setCellValue(data.transactionDate, `F${index + 2}`);
      });

      const outputPath = 'transactions_with_memberships.xlsx';
      await excelUtil.saveWorkbook(outputPath);

      return outputPath;
    } catch (error) {
      console.log('Report generation failed with error:', error);
      throw error;
    }
  }

  async clearFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error('File clearance failes with error:', error);
      throw error;
    }
  }
}
