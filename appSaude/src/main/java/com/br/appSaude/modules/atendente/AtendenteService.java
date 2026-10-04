package com.br.appSaude.modules.atendente;

import com.br.appSaude.modules.atendente.dto.AlterarSenhaRequest;
import com.br.appSaude.modules.atendente.dto.AtendentePerfilResponse;
import com.br.appSaude.modules.atendente.dto.AtualizarAtendenteRequest;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AtendenteService {
    private final AtendenteRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AtendenteService(AtendenteRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public AtendentePerfilResponse buscarPerfil(String cpfAutenticado) {
        return toResponse(buscarPorCpf(cpfAutenticado));
    }

    @Transactional
    public AtendentePerfilResponse atualizarPerfil(String cpfAutenticado, AtualizarAtendenteRequest request) {
        EntittyJpaAtendente atendente = buscarPorCpf(cpfAutenticado);
        atendente.setNomeAtendente(request.nome().trim());
        return toResponse(repository.save(atendente));
    }

    @Transactional
    public void alterarSenha(String cpfAutenticado, AlterarSenhaRequest request) {
        EntittyJpaAtendente atendente = buscarPorCpf(cpfAutenticado);
        if (!passwordEncoder.matches(request.senhaAtual(), atendente.getSenhaAtendente())) {
            throw new IllegalArgumentException("A senha atual está incorreta.");
        }
        atendente.setSenhaAtendente(passwordEncoder.encode(request.novaSenha()));
        repository.save(atendente);
    }

    private EntittyJpaAtendente buscarPorCpf(String cpf) {
        return repository.findByCpfAtendente(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Atendente não encontrado."));
    }

    private AtendentePerfilResponse toResponse(EntittyJpaAtendente atendente) {
        return new AtendentePerfilResponse(atendente.getIdAtendente(),
                atendente.getNomeAtendente(), atendente.getCpfAtendente());
    }
}
