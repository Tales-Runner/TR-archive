export function EmptyState({ message = "검색 결과가 없습니다" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-3xl mb-3 opacity-30">0</div>
      <p className="text-sm text-white/40">{message}</p>
      <p className="text-xs text-white/15 mt-1">필터나 검색어를 바꿔 보세요</p>
    </div>
  );
}
