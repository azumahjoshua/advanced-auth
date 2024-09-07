
import FloatingShape from './compoents/FloatingShape'
import './index.css'

function App() {
 
  return (
      <div className='min-h-screen bg-gradient-to-br
      from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden'>
        <FloatingShape />
        <p className='text-red-500 tex-5xl'>Wellome to my page</p>
      </div>
    
  )
}

export default App

// arn:aws:iam::231253257440:role/APIGateway-SQS
// arn:aws:iam::231253257440:role/Lambda-SQS-DynamoDB
// arn:aws:iam::231253257440:role/Lambda-DynamoDBStreams-SNS
// arn:aws:sqs:us-west-2:231253257440:POC-Queue
// arn:aws:sns:us-west-2:231253257440:POC-Topic:066362cd-ed98-410f-bea3-5c850b5c3bcc
// arn:aws:sns:us-west-2:231253257440:POC-Topic
