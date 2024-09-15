import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { Account } from 'src/modules/accounts/account.entity';
import { Transaction } from 'src/modules/transactions/transaction.entity';
import { PDFDocument } from 'pdf-lib';

jest.mock('pdf-lib');

describe('PdfService - generateAccountStatement', () => {
  let pdfService: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    pdfService = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate an account statement PDF', async () => {
    const account = {
      id: 1,
      user: { username: 'testuser' },
      balance: BigInt(1000),
      accountType: 'Personal',
    } as Account;

    const transactions = [
      {
        id: 1,
        amount: BigInt(500),
        transactionType: 'Deposit',
        reference: 'abc123',
        createdAt: new Date(),
      },
    ] as Transaction[];

    const mockPdfDoc = {
      addPage: jest.fn().mockReturnValue({
        getSize: jest.fn().mockReturnValue({ width: 600, height: 800 }),
        drawText: jest.fn(),
        drawLine: jest.fn(),
      }),
      embedFont: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue(Buffer.from('pdf-data')),
    };

    (PDFDocument.create as jest.Mock).mockResolvedValue(mockPdfDoc);

    const result = await pdfService.generateAccountStatement(
      account,
      transactions,
    );

    expect(PDFDocument.create).toHaveBeenCalled();
    expect(mockPdfDoc.addPage).toHaveBeenCalled();
    expect(mockPdfDoc.save).toHaveBeenCalled();

    expect(result).toEqual(Buffer.from('pdf-data'));
  });
});
