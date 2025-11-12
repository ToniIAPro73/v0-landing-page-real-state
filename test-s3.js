const { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Cargar variables de entorno desde .env.local
require('fs').readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

const s3Client = new S3Client({
  endpoint: `https://${process.env.S3_Endpoint}`,
  region: process.env.S3_Region_Code,
  credentials: {
    accessKeyId: process.env.S3_Access_Key_ID,
    secretAccessKey: process.env.S3_Secret_Access_Key
  }
});

async function testS3() {
  console.log('🔍 Probando conexión a S3...\n');
  console.log('Configuración:');
  console.log(`  Endpoint: ${process.env.S3_Endpoint}`);
  console.log(`  Región: ${process.env.S3_Region_Code}`);
  console.log(`  Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log(`  Access Key ID: ${process.env.S3_Access_Key_ID}`);
  console.log('');

  try {
    // Test 1: Listar buckets
    console.log('Test 1: Listando buckets disponibles...');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    console.log('✅ Conexión exitosa!');
    console.log(`   Buckets encontrados: ${listResponse.Buckets.length}`);
    listResponse.Buckets.forEach(bucket => {
      console.log(`   - ${bucket.Name}`);
    });
    console.log('');

    // Test 2: Subir archivo de prueba
    console.log('Test 2: Subiendo archivo de prueba al bucket...');
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test/test-connection.txt',
      Body: testContent,
      ContentType: 'text/plain'
    });
    await s3Client.send(putCommand);
    console.log('✅ Archivo subido exitosamente!');
    console.log(`   Ubicación: ${process.env.S3_BUCKET_NAME}/test/test-connection.txt`);
    console.log('');

    // Test 3: Generar URL firmada
    console.log('Test 3: Generando URL firmada (válida por 1 hora)...');
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test/test-connection.txt'
    });
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    console.log('✅ URL generada exitosamente!');
    console.log(`   URL: ${signedUrl.substring(0, 100)}...`);
    console.log('');

    console.log('✅✅✅ TODOS LOS TESTS PASARON EXITOSAMENTE ✅✅✅');
    console.log('');
    console.log('S3 está configurado correctamente y listo para usar en preview y producción.');

  } catch (error) {
    console.error('❌ S3 Error:', error.message);
    console.error('Error Code:', error.Code || error.name);
    console.error('Status Code:', error.$metadata?.httpStatusCode);
    console.error('');
    console.error('Detalles del error completo:', error);
    process.exit(1);
  }
}

testS3();
