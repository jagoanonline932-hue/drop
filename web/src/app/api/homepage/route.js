import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const [
      settingsRows,
      slidersRows,
      benefitsRows,
      testimonialsRows,
      faqsRows,
      aggregatorsRows,
      expeditionsRows,
      cmsRows,
      statsRows,
      vipPackagesRows,
      coursesRows,
    ] = await Promise.all([
      sql`SELECT setting_key, setting_value FROM site_settings`,
      sql`SELECT * FROM sliders WHERE is_active = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT * FROM benefits WHERE is_active = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT * FROM testimonials WHERE is_active = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT * FROM faqs WHERE is_active = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT * FROM aggregators WHERE is_active = true AND show_on_homepage = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT * FROM expeditions WHERE is_active = true AND show_on_homepage = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT section, content FROM cms_content`,
      sql`SELECT stat_key, stat_value, label FROM trusted_stats`,
      sql`SELECT * FROM vip_packages WHERE is_active = true ORDER BY order_position ASC, id ASC`,
      sql`SELECT * FROM courses WHERE is_active = true ORDER BY order_position ASC LIMIT 4`,
    ]);

    const settings = settingsRows.reduce((acc, r) => {
      acc[r.setting_key] = r.setting_value;
      return acc;
    }, {});

    const cms = cmsRows.reduce((acc, r) => {
      acc[r.section] = r.content;
      return acc;
    }, {});

    const stats = statsRows.reduce((acc, r) => {
      acc[r.stat_key] = { value: r.stat_value, label: r.label };
      return acc;
    }, {});

    return Response.json({
      settings,
      sliders: slidersRows,
      benefits: benefitsRows,
      testimonials: testimonialsRows,
      faqs: faqsRows,
      aggregators: aggregatorsRows,
      expeditions: expeditionsRows,
      cms,
      stats,
      vipPackages: vipPackagesRows,
      courses: coursesRows,
    });
  } catch (e) {
    console.error("GET /api/homepage", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
