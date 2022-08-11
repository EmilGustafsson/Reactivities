import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { Header, Icon } from 'semantic-ui-react';

interface Props {
    setFiles: (files: any) => void;
}

export default function PhotoWidgetDropzone({setFiles}: Props)  {
    const dzStyle = {
        border: 'dashed 3px #eee',
        borderColor: '#eee',
        borderRadius: '5px',
        paddingTop: '30px',
        textAlign: 'center' as 'center',
        height: 200

    }

    const dZActive = {
        borderColor: 'green'
    }
  const onDrop = useCallback((acceptedFiles: any[]) => {
    const Files2 =  acceptedFiles.map((file: any) => Object.assign(file, {preview: URL.createObjectURL(file)}));
    //console.log(Files2);
    setFiles(Files2);

  }, [setFiles])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()} style={isDragActive ? {...dzStyle, ...dZActive} : dzStyle}>
      <input {...getInputProps()} />
      <Icon name='upload' size='huge' />
      <Header content='Drop image here'/>
    </div>
  )
}