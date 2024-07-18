import TransactionList from "../components/TransactionList";
import Auth from "../components/Auth";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>
      <Auth />
      <TransactionList />
    </main>
  );
}
