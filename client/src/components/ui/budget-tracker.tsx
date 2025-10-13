import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PiggyBank, Plus, TrendingUp } from "lucide-react";
import type { BudgetTracking } from "@shared/schema";

interface BudgetTrackerProps {
  userId: string;
}

export default function BudgetTracker({ userId }: BudgetTrackerProps) {
  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: budgets = [] } = useQuery<BudgetTracking[]>({
    queryKey: ['/api/budgets', userId],
  });

  const addBudgetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/budgets", {
        userId,
        category,
        budgetAmount: Math.round(parseFloat(budgetAmount) * 100),
        month: currentMonth,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets', userId] });
      setCategory("");
      setBudgetAmount("");
    },
  });

  const handleAddBudget = () => {
    if (category && budgetAmount) {
      addBudgetMutation.mutate();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-payday-blue" />
          Budget Tracker
        </CardTitle>
        <CardDescription>Manage your monthly expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-budget-category" className="flex-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input
            data-testid="input-budget-amount"
            type="number"
            placeholder="Amount (₦)"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            className="flex-1"
          />
          <Button
            data-testid="button-add-budget"
            onClick={handleAddBudget}
            disabled={addBudgetMutation.isPending || !category || !budgetAmount}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {budgets.filter(b => b.month === currentMonth).map((budget) => {
            const percentage = Math.min((budget.spentAmount / budget.budgetAmount) * 100, 100);
            const remaining = budget.budgetAmount - budget.spentAmount;
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{budget.category}</p>
                    <p className="text-sm text-muted-foreground">
                      ₦{(budget.spentAmount / 100).toFixed(2)} / ₦{(budget.budgetAmount / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      ₦{Math.abs(remaining / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {remaining >= 0 ? 'remaining' : 'over budget'}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={percentage > 90 ? 'bg-red-100' : 'bg-gray-100'}
                />
              </div>
            );
          })}
          {budgets.filter(b => b.month === currentMonth).length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No budgets set for this month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
