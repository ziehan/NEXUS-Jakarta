import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/main.dart';

void main() {
  testWidgets('renders NEXUS Jakarta navigation and report form', (WidgetTester tester) async {
    await tester.pumpWidget(const NexusApp());

    expect(find.text('Petugas Lapangan'), findsOneWidget);
    expect(find.text('Kirim Laporan'), findsOneWidget);
    expect(find.text('Tiket Saya'), findsOneWidget);

    await tester.tap(find.text('Kirim Laporan'));
    await tester.pumpAndSettle();

    expect(find.text('Buat Laporan Baru'), findsOneWidget);
    expect(find.text('Kirim Laporan'), findsNWidgets(2));
    expect(find.byHintText('Jelaskan masalah fasilitas umum...'), findsOneWidget);
  });
}
