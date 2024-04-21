import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contato } from './contato';
import { ContatoService } from '../contato.service';
import { MatDialog } from '@angular/material/dialog';
import { ContatoDetalheComponent } from '../contato-detalhe/contato-detalhe.component';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario!: FormGroup;
  contatos: Contato[] = []
  colunas = ['foto', 'nome', 'email', 'favorito']

  totalElements: number = 0
  pagina: number = 0
  tamanho: number = 10
  pageSizeOptions: number[] = [10] 

  constructor(
    private fb: FormBuilder,
    private service: ContatoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.montarFormulario()
    this.getContatos(this.pagina, this.tamanho)
  }

  montarFormulario() {
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    })
  }

  getContatos(pagina: number, tamanho: number) {
    this.service
      .getContatos(pagina, tamanho)
      .subscribe(response => {
        this.contatos = response.content
        this.totalElements = response.totalElements
        this.pagina = response.number
      }, erroResponse => {
        console.log(erroResponse)
      })
  }

  submit() {
    const contato = new Contato
    contato.nome = this.formulario.value.nome
    contato.email = this.formulario.value.email
    this.service.salvar(contato).subscribe(
      response => {
        this.getContatos(this.pagina, this.tamanho)
        this.snackBar.open('O contato foi adicoinado!', 'Sucesso!', {
          duration: 6000
        })
        this.formulario.reset()
      },
      erroResponse => {
        console.log(erroResponse)
      }
    )
  }

  favorito(contato: Contato) {
    this.service
      .favorito(contato)
      .subscribe(response => {
        contato.favorito = !contato.favorito
      }, erroResponse => {
        console.log(erroResponse)
      })

  }

  upload(event: Event, contato: Contato) {
    const target = event.target as HTMLInputElement
    const files = target.files as FileList
    if (files) {
      const foto = files[0]
      const formData: FormData = new FormData
      formData.append('foto', foto)
      this.service
        .upload(contato, formData)
        .subscribe(response => {
          this.getContatos(this.pagina, this.tamanho)
        }, erroResponse => {
          console.log(erroResponse)
        })
    }
  }

  visualizarContato(contato: Contato) {
    this.dialog.open(ContatoDetalheComponent, {    
      width: '460px',
      height: '480px',  
      data: contato
    })
  }

  paginar(event: PageEvent) {
    this.pagina = event.pageIndex
    this.getContatos(this.pagina, this.tamanho)
  }

}
