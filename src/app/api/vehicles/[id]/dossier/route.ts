import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Vehicle {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  color: string
  vin: string
  plate: string
  category: string
  purchase_date: string | null
  purchase_price: number | null
  mileage: number | null
  country: string | null
  location: string | null
  notes: string | null
  cover_photo_url: string | null
  created_at: string
  updated_at: string
}

interface MaintenanceRecord {
  id: string
  date: string
  title: string
  description: string | null
  workshop: string | null
  cost: number | null
  mileage: number | null
}

interface Document {
  id: string
  filename: string
  file_url: string
  document_type: string
  uploaded_at: string
}

interface MarketValue {
  id: string
  estimated_value: number
  source: string | null
  notes: string | null
  created_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Fetch maintenance records
    const { data: maintenanceData } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('vehicle_id', id)
      .order('date', { ascending: false })

    // Fetch documents
    const { data: documentsData } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', id)
      .order('uploaded_at', { ascending: false })

    // Fetch latest market value
    const { data: marketValueData } = await supabase
      .from('market_values')
      .select('*')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const categoryLabels: Record<string, string> = {
      sedan: 'Limousine',
      suv: 'SUV',
      coupe: 'Coupé',
      convertible: 'Cabrio',
      wagon: 'Kombi',
      hatchback: 'Schrägheck',
      pickup: 'Pickup',
      van: 'Van',
      sports: 'Sportwagen',
      other: 'Sonstiges',
    }

    const categoryLabel = categoryLabels[vehicle.category] || vehicle.category

    const html = generateDossierHTML(
      vehicle as Vehicle,
      maintenanceData as MaintenanceRecord[] || [],
      documentsData as Document[] || [],
      marketValueData as MarketValue | null,
      categoryLabel
    )

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Dossier_${vehicle.make}_${vehicle.model}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating dossier:', error)
    return NextResponse.json(
      { error: 'Failed to generate dossier' },
      { status: 500 }
    )
  }
}

function generateDossierHTML(
  vehicle: Vehicle,
  maintenance: MaintenanceRecord[],
  documents: Document[],
  marketValue: MarketValue | null,
  categoryLabel: string
): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier - ${vehicle.make} ${vehicle.model}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0A1A2F;
      color: #E6E6E6;
      line-height: 1.6;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      background-color: #0A1A2F;
    }

    header {
      border-bottom: 3px solid #E5C97B;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }

    .header-title {
      display: flex;
      align-items: baseline;
      gap: 15px;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 36px;
      font-weight: 700;
      color: #E6E6E6;
    }

    .year {
      font-size: 20px;
      color: #A0A0A0;
    }

    .subtitle {
      color: #888;
      font-size: 14px;
    }

    h2 {
      font-size: 24px;
      color: #E5C97B;
      margin-top: 40px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }

    h3 {
      font-size: 16px;
      color: #E6E6E6;
      margin-top: 15px;
      margin-bottom: 10px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      background-color: #2A2D30;
      border: 1px solid #333;
      padding: 20px;
      border-radius: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #3D4450;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #888;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      color: #E6E6E6;
      font-weight: 500;
    }

    .badge {
      display: inline-block;
      background-color: #E5C97B;
      background-color: rgba(201, 168, 76, 0.2);
      color: #E5C97B;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .maintenance-item {
      background-color: #2A2D30;
      border: 1px solid #333;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
    }

    .maintenance-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 10px;
    }

    .maintenance-title {
      font-weight: 600;
      color: #E6E6E6;
      font-size: 16px;
    }

    .maintenance-date {
      color: #888;
      font-size: 13px;
    }

    .maintenance-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 12px;
      font-size: 13px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .detail-value {
      color: #C0C0C0;
    }

    .document-item {
      background-color: #2A2D30;
      border: 1px solid #333;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .document-info {
      flex: 1;
    }

    .document-name {
      color: #E6E6E6;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .document-type {
      color: #888;
      font-size: 12px;
    }

    .document-date {
      color: #666;
      font-size: 12px;
    }

    .empty-message {
      color: #666;
      font-style: italic;
      padding: 20px;
      text-align: center;
    }

    .market-value-card {
      background-color: rgba(201, 168, 76, 0.1);
      border: 1px solid #E5C97B;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .market-value-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .market-value-label {
      color: #888;
      font-size: 13px;
    }

    .market-value-amount {
      font-size: 18px;
      font-weight: 600;
      color: #E5C97B;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #333;
      text-align: center;
      color: #666;
      font-size: 12px;
    }

    .print-date {
      color: #666;
      font-size: 12px;
      margin-top: 10px;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 100%;
        padding: 20px;
      }

      page {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <div class="header-title">
        <h1>${vehicle.make} ${vehicle.model}</h1>
        <span class="year">${vehicle.year}</span>
      </div>
      <p class="subtitle">Fahrzeug-Dossier | GarageOS</p>
    </header>

    <!-- Vehicle Details Section -->
    <h2>Fahrzeugdetails</h2>
    <div class="grid">
      <div class="card">
        <div class="detail-row">
          <span class="label">Marke</span>
          <span class="value">${vehicle.make}</span>
        </div>
        <div class="detail-row">
          <span class="label">Modell</span>
          <span class="value">${vehicle.model}</span>
        </div>
        <div class="detail-row">
          <span class="label">Baujahr</span>
          <span class="value">${vehicle.year}</span>
        </div>
        <div class="detail-row">
          <span class="label">Farbe</span>
          <span class="value">${vehicle.color}</span>
        </div>
        <div class="detail-row">
          <span class="label">Kategorie</span>
          <span class="value"><span class="badge">${categoryLabel}</span></span>
        </div>
      </div>

      <div class="card">
        <div class="detail-row">
          <span class="label">Fahrgestellnummer (VIN)</span>
          <span class="value">${vehicle.vin}</span>
        </div>
        <div class="detail-row">
          <span class="label">Kennzeichen</span>
          <span class="value">${vehicle.plate || '-'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Land</span>
          <span class="value">${vehicle.country || '-'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Standort</span>
          <span class="value">${vehicle.location || '-'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Kilometerstand</span>
          <span class="value">${vehicle.mileage !== null ? vehicle.mileage.toLocaleString('de-DE') + ' km' : '-'}</span>
        </div>
      </div>
    </div>

    <!-- Financial Section -->
    <div class="grid">
      <div class="card">
        <div class="detail-row">
          <span class="label">Kaufdatum</span>
          <span class="value">${vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString('de-DE') : '-'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Kaufpreis</span>
          <span class="value">${vehicle.purchase_price ? '€ ' + vehicle.purchase_price.toLocaleString('de-DE') : '-'}</span>
        </div>
      </div>

      ${marketValue ? `
      <div class="market-value-card">
        <div class="market-value-item">
          <span class="market-value-label">Aktueller Marktwert</span>
          <span class="market-value-amount">€ ${marketValue.estimated_value.toLocaleString('de-DE')}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="label">Quelle</span>
          <span class="value">${marketValue.source === 'manual' ? 'Manuell' : marketValue.source === 'mobile_de' ? 'Mobile.de' : marketValue.source === 'autoscout24' ? 'AutoScout24' : marketValue.source || 'Unbekannt'}</span>
        </div>
        ${vehicle.purchase_price ? `
        <div class="detail-row" style="border-bottom: none;">
          <span class="label">Differenz</span>
          <span class="value">${marketValue.estimated_value > vehicle.purchase_price ? '+' : ''}€ ${(marketValue.estimated_value - vehicle.purchase_price).toLocaleString('de-DE')}</span>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>

    <!-- Notizen Section -->
    ${vehicle.notes ? `
    <h2>Notizen</h2>
    <div class="card">
      <p style="white-space: pre-wrap; color: #C0C0C0;">${vehicle.notes}</p>
    </div>
    ` : ''}

    <!-- Maintenance History Section -->
    <h2>Wartungshistorie</h2>
    ${maintenance.length > 0 ? `
      <div>
        ${maintenance.map((record) => `
        <div class="maintenance-item">
          <div class="maintenance-header">
            <span class="maintenance-title">${record.title}</span>
            <span class="maintenance-date">${new Date(record.date).toLocaleDateString('de-DE')}</span>
          </div>
          ${record.description ? `<p style="color: #A0A0A0; font-size: 13px; margin-bottom: 10px;">${record.description}</p>` : ''}
          <div class="maintenance-details">
            ${record.workshop ? `
            <div class="detail-item">
              <span class="detail-label">Werkstatt</span>
              <span class="detail-value">${record.workshop}</span>
            </div>
            ` : ''}
            ${record.cost !== null ? `
            <div class="detail-item">
              <span class="detail-label">Kosten</span>
              <span class="detail-value">€ ${record.cost.toLocaleString('de-DE')}</span>
            </div>
            ` : ''}
            ${record.mileage !== null ? `
            <div class="detail-item">
              <span class="detail-label">Kilometerstand</span>
              <span class="detail-value">${record.mileage.toLocaleString('de-DE')} km</span>
            </div>
            ` : ''}
          </div>
        </div>
        `).join('')}
      </div>
    ` : `
      <p class="empty-message">Keine Wartungseinträge</p>
    `}

    <!-- Documents Section -->
    <h2>Dokumente</h2>
    ${documents.length > 0 ? `
      <div>
        ${documents.map((doc) => `
        <div class="document-item">
          <div class="document-info">
            <div class="document-name">${doc.filename}</div>
            <div style="display: flex; gap: 15px; margin-top: 4px;">
              <span class="document-type">${doc.document_type}</span>
              <span class="document-date">${new Date(doc.uploaded_at).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    ` : `
      <p class="empty-message">Keine Dokumente</p>
    `}

    <!-- Footer -->
    <footer class="footer">
      <p>Dieses Dossier wurde mit GarageOS erstellt</p>
      <p class="print-date">Erstellt am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>
    </footer>
  </div>
</body>
</html>
  `.trim()
}
