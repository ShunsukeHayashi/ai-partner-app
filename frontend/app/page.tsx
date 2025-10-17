export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          AI Partner App
        </h1>

        <div className="text-center space-y-6">
          <p className="text-xl text-muted-foreground">
            擬似恋愛・結婚生活体験アプリケーション
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-2xl font-semibold mb-2">🎭 キャラクター作成</h2>
              <p className="text-muted-foreground">
                理想のパートナーを自由にカスタマイズ
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-2xl font-semibold mb-2">💬 リアルタイム会話</h2>
              <p className="text-muted-foreground">
                AIによる自然な会話体験
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-2xl font-semibold mb-2">💕 5つのステージ</h2>
              <p className="text-muted-foreground">
                出会い→デート→交際→プロポーズ→結婚
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-2xl font-semibold mb-2">🎨 ビジュアル生成</h2>
              <p className="text-muted-foreground">
                BytePlus APIによる画像・動画生成
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex space-x-4 justify-center">
              <a
                href="/register"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                今すぐ始める
              </a>
              <a
                href="/login"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                ログイン
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              Powered by BytePlus AI, Gemini TTS, Claude API
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
