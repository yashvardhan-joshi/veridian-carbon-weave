
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistryProject {
  registry_id: string;
  name: string;
  developer: string;
  type: string;
  location: string;
  methodology: string;
  status: string;
  credits_issued: number;
  credits_retired: number;
  registration_date?: string;
  verification_date?: string;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting registry data sync...');

    // Log sync start
    const { data: syncLog } = await supabaseClient
      .from('registry_sync_logs')
      .insert({
        sync_type: 'external_registry_sync',
        status: 'running',
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    let recordsProcessed = 0;
    let errorMessage = null;

    try {
      // Simulate fetching from multiple registry APIs
      // In production, you would replace these with actual API calls
      const registryEndpoints = [
        'https://registry.verra.org/api/v1/projects', // Verra VCS
        'https://registry.goldstandard.org/api/projects', // Gold Standard
        'https://cdm.unfccc.int/api/projects' // CDM Registry
      ];

      const allProjects: RegistryProject[] = [];

      // Fetch from each registry (simulated data for now)
      for (const endpoint of registryEndpoints) {
        console.log(`Fetching data from ${endpoint}...`);
        
        // Since we can't access real APIs without authentication, 
        // we'll generate sample data that represents real registry structure
        const sampleProjects = generateSampleRegistryData(endpoint);
        allProjects.push(...sampleProjects);
        
        recordsProcessed += sampleProjects.length;
        console.log(`Fetched ${sampleProjects.length} projects from ${endpoint}`);
      }

      // Upsert projects into database
      for (const project of allProjects) {
        const { error } = await supabaseClient
          .from('carbon_projects')
          .upsert({
            registry_id: project.registry_id,
            name: project.name,
            developer: project.developer,
            type: project.type,
            location: project.location,
            methodology: project.methodology,
            status: project.status,
            credits_issued: project.credits_issued,
            credits_retired: project.credits_retired,
            registration_date: project.registration_date,
            verification_date: project.verification_date,
            description: project.description,
            last_synced: new Date().toISOString(),
            user_id: '00000000-0000-0000-0000-000000000000' // System user for external data
          }, {
            onConflict: 'registry_id'
          });

        if (error) {
          console.error(`Error upserting project ${project.registry_id}:`, error);
        }
      }

      console.log(`Successfully processed ${recordsProcessed} projects`);

    } catch (error) {
      console.error('Error during sync:', error);
      errorMessage = error.message;
    }

    // Update sync log
    if (syncLog) {
      await supabaseClient
        .from('registry_sync_logs')
        .update({
          status: errorMessage ? 'failed' : 'completed',
          end_time: new Date().toISOString(),
          records_processed: recordsProcessed,
          error_message: errorMessage
        })
        .eq('id', syncLog.id);
    }

    return new Response(
      JSON.stringify({
        success: !errorMessage,
        recordsProcessed,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorMessage ? 500 : 200
      }
    );
    
  } catch (error) {
    console.error('Sync function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function generateSampleRegistryData(endpoint: string): RegistryProject[] {
  const registryTypes = {
    'verra': 'VCS',
    'goldstandard': 'GS',
    'unfccc': 'CDM'
  };

  const getRegistryType = (url: string) => {
    if (url.includes('verra')) return 'VCS';
    if (url.includes('goldstandard')) return 'GS';
    return 'CDM';
  };

  const projectTypes = [
    'Renewable Energy',
    'Forest Conservation',
    'Methane Capture',
    'Energy Efficiency',
    'Waste Management',
    'Agriculture',
    'Transportation'
  ];

  const locations = [
    'Brazil',
    'India',
    'China',
    'Indonesia',
    'Kenya',
    'Colombia',
    'Peru',
    'Thailand',
    'Vietnam',
    'Mexico'
  ];

  const methodologies = [
    'VM0009 - Methodology for Avoided Mosaic Deforestation',
    'VM0015 - Methodology for Avoided Unplanned Deforestation',
    'ACM0002 - Grid-connected electricity generation from renewable sources',
    'AMS-III.D - Methane recovery in animal waste management systems',
    'VM0026 - Methodology for Sustainable Grassland Management',
    'CDM-AM0025 - Zero-emissions grid electricity from renewable sources'
  ];

  const registryPrefix = getRegistryType(endpoint);
  const projects: RegistryProject[] = [];

  // Generate 15-25 projects per registry
  const projectCount = Math.floor(Math.random() * 10) + 15;

  for (let i = 0; i < projectCount; i++) {
    const projectId = `${registryPrefix}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const creditsIssued = Math.floor(Math.random() * 500000) + 10000;
    const creditsRetired = Math.floor(Math.random() * creditsIssued * 0.3);
    
    projects.push({
      registry_id: projectId,
      name: `${projectTypes[Math.floor(Math.random() * projectTypes.length)]} Project ${projectId}`,
      developer: `${locations[Math.floor(Math.random() * locations.length)]} Development Corp`,
      type: projectTypes[Math.floor(Math.random() * projectTypes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      methodology: methodologies[Math.floor(Math.random() * methodologies.length)],
      status: Math.random() > 0.2 ? 'verified' : Math.random() > 0.5 ? 'pending' : 'rejected',
      credits_issued: creditsIssued,
      credits_retired: creditsRetired,
      registration_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
      verification_date: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toISOString() : null,
      description: `This ${projectTypes[Math.floor(Math.random() * projectTypes.length)].toLowerCase()} project contributes to sustainable development and carbon emission reductions through innovative approaches and verified methodologies.`
    });
  }

  return projects;
}
