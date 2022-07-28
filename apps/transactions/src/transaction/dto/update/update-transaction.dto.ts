import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from '../create/create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
