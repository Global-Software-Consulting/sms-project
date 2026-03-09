'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function Wallet() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const transactions = [
    {
      id: 'TXN-9876',
      type: 'deposit',
      amount: 50.0,
      status: 'completed',
      date: 'Feb 13, 2026 11:30',
      method: 'Credit Card',
    },
    {
      id: 'TXN-9875',
      type: 'purchase',
      amount: -1.5,
      status: 'completed',
      date: 'Feb 13, 2026 12:15',
      description: 'Telegram - UK (V2)',
    },
    {
      id: 'TXN-9874',
      type: 'purchase',
      amount: -0.5,
      status: 'completed',
      date: 'Feb 13, 2026 14:32',
      description: 'WhatsApp - US (V1)',
    },
    {
      id: 'TXN-9873',
      type: 'refund',
      amount: 0.6,
      status: 'completed',
      date: 'Feb 12, 2026 16:45',
      description: 'Cancelled order refund',
    },
    {
      id: 'TXN-9872',
      type: 'deposit',
      amount: 100.0,
      status: 'completed',
      date: 'Feb 10, 2026 09:20',
      method: 'PayPal',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground mt-1">
          Manage your balance and transactions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>Top up your wallet balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
              <div className="mt-2 flex gap-2">
                {[10, 25, 50, 100].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value.toString())}
                  >
                    ${value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-primary text-4xl font-bold">$127.45</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Available balance
                </p>
              </div>

              <div className="border-border space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-medium">$234.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Deposited</span>
                  <span className="font-medium">$350.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Savings (Pro 25%)
                  </span>
                  <span className="text-success font-medium">$58.63</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your wallet transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="table-hide-mobile">
                    Description
                  </TableHead>
                  <TableHead className="table-hide-tablet">Date</TableHead>
                  <TableHead className="table-hide-mobile">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {txn.type === 'deposit' ? (
                          <div className="bg-success/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                            <ArrowDownRight className="text-success h-4 w-4" />
                          </div>
                        ) : txn.type === 'purchase' ? (
                          <div className="bg-destructive/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                            <ArrowUpRight className="text-destructive h-4 w-4" />
                          </div>
                        ) : (
                          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                            <ArrowDownRight className="text-primary h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium capitalize">
                            {txn.type}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {txn.id}
                          </p>
                          {/* Show condensed info on mobile */}
                          <p className="text-muted-foreground mt-0.5 text-xs sm:hidden">
                            {txn.date}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="table-hide-mobile">
                      <p className="text-sm">
                        {txn.type === 'deposit' ? txn.method : txn.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground table-hide-tablet text-sm">
                      {txn.date}
                    </TableCell>
                    <TableCell className="table-hide-mobile">
                      <Badge variant="secondary" className="capitalize">
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`font-semibold ${txn.amount > 0 ? 'text-success' : 'text-foreground'}`}
                        >
                          {txn.amount > 0 ? '+' : ''}$
                          {Math.abs(txn.amount).toFixed(2)}
                        </span>
                        {/* Show status badge on mobile */}
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize sm:hidden"
                        >
                          {txn.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
