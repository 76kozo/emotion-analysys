# Realtime Emotion Analyzer (リアルタイム感情分析アプリ)

[![Deploy with Vercel](https://vercel.com/button)](https://emotion-analysys.vercel.app/)

**[>>> 公開デモはこちら (Live Demo)](https://emotion-analysys.vercel.app/) <<<**

---

このプロジェクトは、Webカメラからの映像を利用して、リアルタイムで人物の感情を分析し、視覚的に表示するWebアプリケーションです。Google Cloud Vision APIを活用し、検出された感情を複数のインタラクティブなグラフで可視化します。ユーザー自身のAPIキーを使用して、セキュアかつプライベートな環境で分析を実行できます。

## ✨ 主な機能

-   **リアルタイム映像取得**: ユーザーのWebカメラから映像をリアルタイムでキャプチャします。
-   **AIによる感情分析**: 取得した映像をGoogle Cloud Vision APIに送信し、顔の表情から複数の感情（喜び、悲しみ、驚きなど）を分析します。
-   **APIキーのユーザー入力**: アプリケーションに開発者のAPIキーを埋め込むのではなく、ユーザーが自身のGoogle Cloud Vision APIキーを入力して利用する方式を採用。これにより、セキュリティを確保し、ユーザーは自身のAPI使用量を管理できます。
-   **多彩なデータ可視化**:
    -   **IntensityChart (強度グラフ)**: 現在の各感情の強度を棒グラフで表示します。
    -   **DistributionChart (分布グラフ)**: 検出された感情の構成比率をドーナツグラフで示します。
    -   **TimelineChart (時系列グラフ)**: 時間の経過と共に各感情の強さがどう変化したかを折れ線グラフで追跡します。
-   **顔の検出とアノテーション**:
    -   AIが認識している顔を黄色い**フレーム**で囲み、どの顔が分析対象か明確に示します。
    -   フレーム上部には、最も確信度の高い感情とパーセンテージ（例: `Surprised: 100%`）が**アノテーション**として表示されます。
-   **CSVデータエクスポート**: 分析セッション中に記録された全時系列データをCSVファイルとしてダウンロードできます。研究やさらなる分析に活用可能です。
-   **アクセシビリティへの配慮**:
    -   知的障害を持つ方々にも直感的に理解しやすいよう、グラフの凡例は「日本語＋絵文字」で表示されます。
    -   目に優しいダークテーマを基調としたモダンなUIデザインを採用しています。

## 🚀 使用技術

-   **フレームワーク**: Next.js (App Router)
-   **UIライブラリ**: React
-   **言語**: TypeScript
-   **スタイリング**: Tailwind CSS
-   **グラフ描画**: Chart.js, react-chartjs-2
-   **API**: Google Cloud Vision API

## 💻 セットアップと実行方法

### 前提条件

-   Node.js (v18.x 以上)
-   npm または yarn
-   Google Cloud Platform (GCP) アカウント
-   有効な課金情報が紐づいたGCPプロジェクト
-   プロジェクトで **Cloud Vision API** が有効化されていること
-   上記APIの認証情報として作成された **APIキー**

### インストールから実行まで

1.  **リポジトリをクローン**
    ```bash
    git clone https://github.com/your-username/emotion-analysys.git
    ```

2.  **プロジェクトディレクトリへ移動**
    ```bash
    cd emotion-analysys
    ```

3.  **依存関係をインストール**
    ```bash
    npm install
    ```

4.  **開発サーバーを起動**
    ```bash
    npm run dev
    ```

5.  **アプリケーションにアクセス**
    -   ブラウザで `http://localhost:3000` を開きます。

6.  **APIキーの入力と分析開始**
    -   画面上部の入力フィールドに、ご自身の **Google Cloud Vision APIキー** を貼り付けます。
    -   `Start Capture` ボタンをクリックしてWebカメラを起動します。
    -   `Start Analysis` ボタンをクリックすると、リアルタイム感情分析が開始されます。

## 📄 ライセンス

このプロジェクトはMITライセンスのもとで公開されています。 