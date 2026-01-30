export class CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  
  productName: string;
  productSize: string;
  amount: number; // Em reais
}