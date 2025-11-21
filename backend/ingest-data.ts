/**
 * Data Ingestion Script
 * 
 * Loads all personal data from JSON files and ingests into vector database
 */

import { ingestAllData } from './src/services/dataManager';

async function main() {
  console.log('\n🚀 Starting Data Ingestion for Buddy\n');
  console.log('='.repeat(60));
  
  try {
    const result = await ingestAllData();
    
    console.log('\n' + '='.repeat(60));
    
    if (result.success) {
      console.log('✅ Data ingestion completed successfully!');
      console.log(`📊 Total documents added: ${result.documentsAdded}`);
      console.log('\n🎉 Your personal data is now ready for semantic search!');
      console.log('\n📝 Next steps:');
      console.log('   1. Start the backend: npm run dev');
      console.log('   2. Test queries via API');
      console.log('   3. Build the Chrome extension (Phase 3)\n');
    } else {
      console.error('❌ Data ingestion failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error during data ingestion:', error);
    process.exit(1);
  }
}

main();

