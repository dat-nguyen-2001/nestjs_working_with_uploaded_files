import ExcelJS = require('exceljs');
import { Worksheet } from 'exceljs';

export class ExcelUtil {
  private workbook: Record<string, any>;
  private worksheet: Worksheet;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  public async readFile(filename: string) {
    return await this.workbook.xlsx.readFile(filename);
  }

  public async loadFile(filename: string, sheetNumber: number) {
    await this.workbook.xlsx.readFile(filename);
    this.worksheet = this.workbook.getWorksheet(sheetNumber);
  }

  // get buffer
  public async getbuffer() {
    return await this.workbook.xlsx.writeBuffer();
  }

  // set cell value
  public setCellValue(value: string | number, cellName: string) {
    const cell = this.worksheet.getCell(cellName);
    // Modify/Add individual cell
    if (cell) {
      cell.value = value;
    }
    return cell;
  }

  // set duplicate Cell value
  public duplicateCell(
    value: string | number,
    srcCell: string,
    dstCell: string,
  ) {
    const cSrc = this.worksheet.getCell(srcCell);
    // Modify/Add individual cell
    const cDst = this.worksheet.getCell(dstCell);

    if (cSrc && cDst) {
      cDst.value = value;
      cDst.style = cSrc.style;
    }
  }

  public async saveWorkbook(outputPath: string) {
    if (!this.workbook) {
      throw new Error('Workbook is not loaded.');
    }
    await this.workbook.xlsx.writeFile(outputPath);
  }
}
