import { Controller, Get, Put, Delete, Param, Body, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { CustomerService } from '@domain/customers/customer.service';
import type { UpdateCustomerDto } from '@domain/customers/types/customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) { }

  @Get()
  async findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.customerService.delete(id);
  }

  @Put(':id/activate')
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.activate(id);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.deactivate(id);
  }
}