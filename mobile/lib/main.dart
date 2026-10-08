import 'package:flutter/material.dart';

const _background = Color(0xFFF8FAFC);
const _purple = Color(0xFF7C3AED);
const _amber = Color(0xFFF59E0B);
const _green = Color(0xFF10B981);
const _ink = Color(0xFF0F172A);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE2E8F0);

void main() => runApp(const NexusApp());

class NexusApp extends StatelessWidget {
  const NexusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEXUS Jakarta',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: _background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _purple,
          brightness: Brightness.light,
        ).copyWith(primary: _purple, surface: Colors.white),
        fontFamily: 'Roboto',
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          hintStyle: const TextStyle(color: _muted, height: 1.4),
          contentPadding: const EdgeInsets.all(16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _purple, width: 1.5),
          ),
        ),
      ),
      home: const NexusShell(),
    );
  }
}

class NexusShell extends StatefulWidget {
  const NexusShell({super.key});

  @override
  State<NexusShell> createState() => _NexusShellState();
}

class _NexusShellState extends State<NexusShell> {
  int _selectedIndex = 0;
  final _descriptionController = TextEditingController();

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _selectTab(int index) => setState(() => _selectedIndex = index);

  @override
  Widget build(BuildContext context) {
    final pages = [
      const FieldTaskView(),
      ReportView(controller: _descriptionController),
      const TicketsView(),
      const ProfileView(),
    ];

    return Scaffold(
      body: SafeArea(child: IndexedStack(index: _selectedIndex, children: pages)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _selectTab,
        backgroundColor: Colors.white,
        indicatorColor: _purple.withOpacity(.12),
        elevation: 8,
        height: 72,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.add_circle_outline), selectedIcon: Icon(Icons.add_circle), label: 'Kirim Laporan'),
          NavigationDestination(icon: Icon(Icons.confirmation_number_outlined), selectedIcon: Icon(Icons.confirmation_number), label: 'Tiket Saya'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}

class PageHeader extends StatelessWidget {
  const PageHeader({super.key, required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(subtitle, style: const TextStyle(color: _muted, fontSize: 14)),
              const SizedBox(height: 4),
              Text(title, style: const TextStyle(color: _ink, fontSize: 24, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: _border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: IconButton(
            tooltip: 'Notifikasi',
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_rounded, color: _ink),
          ),
        ),
      ],
    );
  }
}

class FieldTaskView extends StatelessWidget {
  const FieldTaskView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(title: 'Petugas Lapangan', subtitle: 'Selamat pagi, Raka'),
          const SizedBox(height: 24),
          const SectionLabel(label: 'Tugas hari ini'),
          const SizedBox(height: 10),
          const TaskCard(),
          const SizedBox(height: 20),
          const SectionLabel(label: 'Ringkasan aktivitas'),
          const SizedBox(height: 10),
          Row(
            children: const [
              Expanded(child: SummaryCard(value: '08', label: 'Selesai', color: _green)),
              SizedBox(width: 12),
              Expanded(child: SummaryCard(value: '03', label: 'Berjalan', color: _amber)),
            ],
          ),
        ],
      ),
    );
  }
}

class TaskCard extends StatelessWidget {
  const TaskCard({super.key});

  @override
  Widget build(BuildContext context) {
    return SurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('RPT-24081', style: TextStyle(color: _purple, fontWeight: FontWeight.w700, fontSize: 13)),
              ),
              StatusPill(label: 'High Priority', color: _amber, background: const Color(0xFFFFF7E6)),
            ],
          ),
          const SizedBox(height: 10),
          const Text('Perbaikan Jalan Berlubang', style: TextStyle(color: _ink, fontSize: 19, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          const Text('Jl. Kemang Raya No. 12, Jakarta Selatan', style: TextStyle(color: _muted, fontSize: 14)),
          const Divider(height: 28, color: _border),
          const DetailRow(icon: Icons.business_outlined, label: 'Instansi', value: 'Dinas Bina Marga'),
          const SizedBox(height: 12),
          const DetailRow(icon: Icons.schedule_outlined, label: 'Batas waktu', value: 'Hari ini, 16:00'),
          const SizedBox(height: 20),
          const UploadBox(label: 'Unggah foto bukti perbaikan'),
          const SizedBox(height: 14),
          const Row(
            children: [
              StatusPill(label: 'AI Verification Pending', color: _amber, background: Color(0xFFFFF7E6)),
              Spacer(),
              Icon(Icons.verified_outlined, color: _muted, size: 18),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              style: _primaryButtonStyle,
              child: const Text('Kirim Bukti Perbaikan'),
            ),
          ),
        ],
      ),
    );
  }
}

class ReportView extends StatelessWidget {
  const ReportView({super.key, required this.controller});

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(title: 'Halo, Warga Jakarta', subtitle: 'Mari jaga kota bersama'),
          const SizedBox(height: 24),
          const Text('Buat Laporan Baru', style: TextStyle(color: _ink, fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          const Text('Sampaikan masalah fasilitas umum di sekitar Anda.', style: TextStyle(color: _muted)),
          const SizedBox(height: 16),
          SurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const FieldLabel(label: 'Deskripsi masalah'),
                const SizedBox(height: 8),
                TextFormField(
                  controller: controller,
                  minLines: 5,
                  maxLines: 7,
                  decoration: const InputDecoration(hintText: 'Jelaskan masalah fasilitas umum...'),
                ),
                const SizedBox(height: 18),
                const FieldLabel(label: 'Foto pendukung'),
                const SizedBox(height: 8),
                const UploadBox(label: 'Tambah foto masalah'),
                const SizedBox(height: 18),
                const FieldLabel(label: 'Lokasi laporan'),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F3FF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _purple.withOpacity(.16)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.location_on_outlined, color: _purple, size: 20),
                      SizedBox(width: 10),
                      Expanded(child: Text('Kemang, Jakarta Selatan', style: TextStyle(color: _ink, fontWeight: FontWeight.w600))),
                      Icon(Icons.gps_fixed, color: _purple, size: 18),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {},
                    style: _primaryButtonStyle,
                    child: const Text('Kirim Laporan'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class TicketsView extends StatelessWidget {
  const TicketsView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(title: 'Tiket Saya', subtitle: 'Pantau laporan Anda'),
          const SizedBox(height: 24),
          const TicketCard(id: 'RPT-24072', title: 'Lampu jalan mati', location: 'Mampang, Jakarta Selatan', status: 'Terverifikasi', color: _green),
          const SizedBox(height: 12),
          const TicketCard(id: 'RPT-24081', title: 'Jalan berlubang', location: 'Kemang, Jakarta Selatan', status: 'Dalam proses', color: _amber),
        ],
      ),
    );
  }
}

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      child: Column(
        children: [
          const PageHeader(title: 'Profil', subtitle: 'Akun NEXUS Jakarta'),
          const SizedBox(height: 24),
          const SurfaceCard(
            child: Row(
              children: [
                CircleAvatar(radius: 28, backgroundColor: Color(0xFFEDE9FE), child: Icon(Icons.person, color: _purple)),
                SizedBox(width: 14),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Raka Pratama', style: TextStyle(color: _ink, fontWeight: FontWeight.w700, fontSize: 17)),
                  SizedBox(height: 4),
                  Text('Warga Jakarta Selatan', style: TextStyle(color: _muted)),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SurfaceCard extends StatelessWidget {
  const SurfaceCard({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: _border),
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class UploadBox extends StatelessWidget {
  const UploadBox({super.key, required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _DashedBorderPainter(),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          children: [
            Icon(Icons.camera_alt_outlined, color: _purple.withOpacity(.8), size: 28),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(color: _ink, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            const Text('JPG atau PNG, maksimal 5 MB', style: TextStyle(color: _muted, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _DashedBorderPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = _border..strokeWidth = 1.5..style = PaintingStyle.stroke;
    const dash = 6.0;
    const gap = 4.0;
    final path = Path()..addRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(12)));
    for (final metric in path.computeMetrics()) {
      for (double distance = 0; distance < metric.length; distance += dash + gap) {
        canvas.drawPath(metric.extractPath(distance, distance + dash), paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class SectionLabel extends StatelessWidget {
  const SectionLabel({super.key, required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => Text(label, style: const TextStyle(color: _ink, fontWeight: FontWeight.w700, fontSize: 16));
}

class FieldLabel extends StatelessWidget {
  const FieldLabel({super.key, required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => Text(label, style: const TextStyle(color: _ink, fontWeight: FontWeight.w600));
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, required this.color, required this.background});
  final String label;
  final Color color;
  final Color background;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
        decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(20)),
        child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
      );
}

class DetailRow extends StatelessWidget {
  const DetailRow({super.key, required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Row(
        children: [
          Icon(icon, color: _muted, size: 20),
          const SizedBox(width: 10),
          Text('$label  ', style: const TextStyle(color: _muted, fontSize: 13)),
          Expanded(child: Text(value, style: const TextStyle(color: _ink, fontWeight: FontWeight.w600))),
        ],
      );
}

class SummaryCard extends StatelessWidget {
  const SummaryCard({super.key, required this.value, required this.label, required this.color});
  final String value;
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => SurfaceCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(value, style: TextStyle(color: color, fontSize: 26, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: _muted)),
        ]),
      );
}

class TicketCard extends StatelessWidget {
  const TicketCard({super.key, required this.id, required this.title, required this.location, required this.status, required this.color});
  final String id;
  final String title;
  final String location;
  final String status;
  final Color color;
  @override
  Widget build(BuildContext context) => SurfaceCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [Expanded(child: Text(id, style: const TextStyle(color: _purple, fontWeight: FontWeight.w700, fontSize: 13))), StatusPill(label: status, color: color, background: color == _green ? const Color(0xFFE9FBF4) : const Color(0xFFFFF7E6))]),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(color: _ink, fontSize: 17, fontWeight: FontWeight.w700)),
          const SizedBox(height: 5),
          Text(location, style: const TextStyle(color: _muted, fontSize: 13)),
        ]),
      );
}

final _primaryButtonStyle = ElevatedButton.styleFrom(
  backgroundColor: _purple,
  foregroundColor: Colors.white,
  minimumSize: const Size.fromHeight(50),
  elevation: 0,
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  textStyle: const TextStyle(fontWeight: FontWeight.w700),
);
