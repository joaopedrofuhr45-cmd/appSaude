function normalizarData(data) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12);
}

function lerDataISO(valor) {
    const resultado = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor ?? "");
    if (!resultado) return null;
    return new Date(Number(resultado[1]), Number(resultado[2]) - 1, Number(resultado[3]), 12);
}

function dataParaISO(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function somarDias(data, quantidade) {
    const resultado = normalizarData(data);
    resultado.setDate(resultado.getDate() + quantidade);
    return resultado;
}

function inicioDaSemana(data) {
    const resultado = normalizarData(data);
    const diasDesdeSegunda = (resultado.getDay() + 6) % 7;
    resultado.setDate(resultado.getDate() - diasDesdeSegunda);
    return resultado;
}

export function montarCalendarioSemana({
    input,
    dias,
    titulo,
    anterior,
    proximo,
    hoje,
    permitirDatasPassadas = false,
}) {
    const hojeData = normalizarData(new Date());
    const hojeISO = dataParaISO(hojeData);
    const minSemana = inicioDaSemana(hojeData);
    let dataSelecionada = lerDataISO(input.value) ?? hojeData;

    if (!permitirDatasPassadas && dataParaISO(dataSelecionada) < hojeISO) {
        dataSelecionada = hojeData;
    }

    function renderizar() {
        const mesAno = new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric",
        }).format(dataSelecionada);
        titulo.textContent = mesAno.replace(/^./u, (letra) => letra.toLocaleUpperCase("pt-BR"));

        const inicio = inicioDaSemana(dataSelecionada);
        dias.replaceChildren();

        for (let indice = 0; indice < 7; indice += 1) {
            const data = somarDias(inicio, indice);
            const dataISO = dataParaISO(data);
            const diaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
                .format(data).replace(/\./g, "");
            const nomeDia = diaSemana.charAt(0).toLocaleUpperCase("pt-BR") + diaSemana.slice(1);
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "week-calendar__day";
            botao.dataset.date = dataISO;
            botao.setAttribute("aria-pressed", String(dataISO === dataParaISO(dataSelecionada)));
            botao.setAttribute("aria-label", data.toLocaleDateString("pt-BR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
            }));

            if (dataISO === dataParaISO(dataSelecionada)) botao.classList.add("is-selected");
            if (dataISO === hojeISO) botao.classList.add("is-today");
            if (!permitirDatasPassadas && dataISO < hojeISO) botao.disabled = true;

            const dia = document.createElement("span");
            dia.className = "week-calendar__weekday";
            dia.textContent = nomeDia;
            const numero = document.createElement("strong");
            numero.className = "week-calendar__number";
            numero.textContent = String(data.getDate());
            botao.append(dia, numero);
            dias.append(botao);
        }

        anterior.disabled = !permitirDatasPassadas && inicioDaSemana(dataSelecionada) <= minSemana;
    }

    function definirData(valor, notificar = true) {
        const data = lerDataISO(valor);
        if (!data) return;
        dataSelecionada = !permitirDatasPassadas && dataParaISO(data) < hojeISO ? hojeData : data;
        input.value = dataParaISO(dataSelecionada);
        renderizar();
        if (notificar) input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    dias.addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-date]");
        if (botao && dias.contains(botao) && !botao.disabled) definirData(botao.dataset.date);
    });

    anterior.addEventListener("click", () => definirData(dataParaISO(somarDias(dataSelecionada, -7))));
    proximo.addEventListener("click", () => definirData(dataParaISO(somarDias(dataSelecionada, 7))));
    hoje.addEventListener("click", () => definirData(hojeISO));

    input.value = dataParaISO(dataSelecionada);
    renderizar();

    return {
        definirData,
        obterData: () => input.value,
    };
}
